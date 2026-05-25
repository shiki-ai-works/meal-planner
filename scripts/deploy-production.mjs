import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const isWindows = process.platform === 'win32'
const npmBin = isWindows ? 'npm.cmd' : 'npm'
const npxBin = isWindows ? 'npx.cmd' : 'npx'
const args = new Set(process.argv.slice(2))

const requiredKeys = [
  'VERCEL_TOKEN',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

function printHelp() {
  console.log(`Deploy production

Usage:
  npm run deploy:production
  npm run deploy:production -- --skip-local-e2e

Required in .env.local or the shell:
  VERCEL_TOKEN
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY

Project link:
  Set VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME when .vercel/project.json does not exist.
  Set VERCEL_ORG_ID, VERCEL_TEAM_ID, or VERCEL_SCOPE for a team project.

Optional:
  PRODUCTION_URL       Use this URL for post-deploy E2E instead of parsing Vercel output.
  VERCEL_ASCII_HOSTNAME Override the ASCII hostname used for Vercel CLI headers.`)
}

function normalizeValue(value) {
  const trimmed = value.trim()
  const quote = trimmed[0]

  if (
    (quote === '"' || quote === "'") &&
    trimmed.endsWith(quote) &&
    trimmed.length >= 2
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

function parseEnvFile(fileName) {
  const filePath = resolve(rootDir, fileName)
  if (!existsSync(filePath)) return {}

  const values = {}
  const source = readFileSync(filePath, 'utf8')

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue

    values[match[1]] = normalizeValue(match[2])
  }

  return values
}

function buildEnv(overrides = {}) {
  const localEnv = {
    ...parseEnvFile('.env'),
    ...parseEnvFile('.env.development.local'),
    ...parseEnvFile('.env.local'),
  }
  const hookPath = resolve(rootDir, 'scripts/vercel-ascii-hostname.cjs')
  const nodeOptions = [
    process.env.NODE_OPTIONS,
    `--require=${hookPath}`,
  ].filter(Boolean)

  return {
    ...process.env,
    ...localEnv,
    CI: '1',
    VERCEL_TELEMETRY_DISABLED: '1',
    VERCEL_ASCII_HOSTNAME:
      process.env.VERCEL_ASCII_HOSTNAME ??
      localEnv.VERCEL_ASCII_HOSTNAME ??
      'codex-local',
    NODE_OPTIONS: nodeOptions.join(' '),
    ...overrides,
  }
}

const env = buildEnv()

function fail(message) {
  console.error(message)
  process.exit(1)
}

function assertRequiredEnv() {
  const missing = requiredKeys.filter((key) => !env[key]?.trim())
  if (missing.length > 0) {
    fail(`Missing required deployment env: ${missing.join(', ')}`)
  }

  const hasProjectLink = existsSync(resolve(rootDir, '.vercel/project.json'))
  const project = env.VERCEL_PROJECT_ID || env.VERCEL_PROJECT_NAME
  if (!hasProjectLink && !project) {
    fail(
      'Missing Vercel project link. Set VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME, or run vercel link once.',
    )
  }
}

function run(command, commandArgs, options = {}) {
  const { input, capture = false, env: envOverrides = {} } = options
  const commandEnv = { ...env, ...envOverrides }

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: rootDir,
      env: commandEnv,
      stdio: [
        input === undefined ? 'ignore' : 'pipe',
        capture ? 'pipe' : 'inherit',
        capture ? 'pipe' : 'inherit',
      ],
    })

    let output = ''

    if (input !== undefined) {
      child.stdin.end(input)
    }

    if (capture) {
      child.stdout.on('data', (chunk) => {
        output += chunk
        process.stdout.write(chunk)
      })
      child.stderr.on('data', (chunk) => {
        output += chunk
        process.stderr.write(chunk)
      })
    }

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise(output)
      } else {
        reject(
          new Error(`${command} ${commandArgs.join(' ')} failed with ${code}`),
        )
      }
    })
  })
}

async function ensureVercelLink() {
  if (existsSync(resolve(rootDir, '.vercel/project.json'))) {
    return
  }

  const project = env.VERCEL_PROJECT_ID || env.VERCEL_PROJECT_NAME
  const team = env.VERCEL_ORG_ID || env.VERCEL_TEAM_ID || env.VERCEL_SCOPE
  const linkArgs = [
    'vercel',
    'link',
    '--yes',
    '--non-interactive',
    '--project',
    project,
  ]

  if (team) {
    linkArgs.push('--team', team)
  }

  await run(npxBin, linkArgs)
}

async function setVercelEnv(name, value) {
  await run(
    npxBin,
    [
      'vercel',
      'env',
      'add',
      name,
      'production',
      '--yes',
      '--force',
      '--non-interactive',
    ],
    { input: `${value}\n` },
  )
}

function parseProductionUrl(output) {
  if (env.PRODUCTION_URL) return env.PRODUCTION_URL.replace(/\/$/, '')

  const matches = [...output.matchAll(/https:\/\/[^\s)]+/g)].map((match) =>
    match[0].replace(/[.,]+$/, ''),
  )

  return matches.reverse().find((url) => url.includes('.vercel.app')) ?? null
}

async function main() {
  if (args.has('--help') || args.has('-h')) {
    printHelp()
    return
  }

  assertRequiredEnv()

  if (!args.has('--skip-local-e2e')) {
    await run(npmBin, ['run', 'e2e:public'])
  }

  await ensureVercelLink()
  await setVercelEnv(
    'NEXT_PUBLIC_SUPABASE_URL',
    env.NEXT_PUBLIC_SUPABASE_URL,
  )
  await setVercelEnv(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  const deployOutput = await run(
    npxBin,
    ['vercel', '--prod', '--yes', '--non-interactive'],
    { capture: true },
  )
  const productionUrl = parseProductionUrl(deployOutput)

  if (!productionUrl) {
    fail('Deployment finished, but no production URL could be detected.')
  }

  await run(process.execPath, ['scripts/e2e-public-flow.mjs'], {
    env: { E2E_BASE_URL: productionUrl },
  })

  console.log(`Production E2E passed: ${productionUrl}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
