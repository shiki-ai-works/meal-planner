import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  envExample: '.env.example',
  gitignore: '.gitignore',
  deploy: 'scripts/deploy-production.mjs',
  readme: 'README.md',
  deployment: 'DEPLOYMENT.md',
}

const expectedEnvExampleValues = new Map([
  ['NEXT_PUBLIC_SUPABASE_URL', 'your-supabase-project-url'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'your-supabase-anon-key'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'your-supabase-service-role-key'],
  ['VERCEL_TOKEN', 'your-vercel-token'],
  ['VERCEL_ORG_ID', 'your-vercel-team-or-user-id'],
  ['VERCEL_PROJECT_ID', 'your-vercel-project-id'],
  ['VERCEL_PROJECT_NAME', 'meal-planner'],
  ['SUPABASE_ACCESS_TOKEN', 'your-supabase-access-token'],
  ['PRODUCTION_URL', 'https://your-production-domain'],
])

const secretLikeKeyPattern =
  /(SECRET|SERVICE_ROLE|ACCESS_TOKEN|TOKEN|PASSWORD|PRIVATE_KEY)/i
const publicSecretKeyPattern =
  /^NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE|TOKEN|PASSWORD|PRIVATE_KEY)/i
const allowedVercelProductionEnv = new Set([
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
])

function readProjectFile(file) {
  const path = resolve(file)
  if (!existsSync(path)) {
    throw new Error(`Required file does not exist: ${file}`)
  }

  return readFileSync(path, 'utf8')
}

function stripByteOrderMark(source) {
  return source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
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

function parseEnvExample(source) {
  const values = new Map()

  for (const line of stripByteOrderMark(source).split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed)
    if (!match) continue

    values.set(match[1], normalizeValue(match[2]))
  }

  return values
}

function assertEnvExample(values) {
  for (const [key, expectedValue] of expectedEnvExampleValues) {
    const value = values.get(key)

    if (value === undefined) {
      throw new Error(`.env.example should include ${key}`)
    }
    if (value !== expectedValue) {
      throw new Error(
        `.env.example should keep ${key} as placeholder "${expectedValue}"`,
      )
    }
  }

  for (const [key, value] of values) {
    if (publicSecretKeyPattern.test(key)) {
      throw new Error(
        `.env.example must not expose secret-like keys via NEXT_PUBLIC_: ${key}`,
      )
    }

    if (
      secretLikeKeyPattern.test(key) &&
      key !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY' &&
      !value.toLowerCase().includes('your-')
    ) {
      throw new Error(`.env.example should keep ${key} as a placeholder value`)
    }
  }
}

function assertGitignore(gitignore) {
  if (!/^\.env\*$/m.test(gitignore)) {
    throw new Error('.gitignore should ignore local env files with .env*')
  }
  if (!/^!\.env\.example$/m.test(gitignore)) {
    throw new Error('.gitignore should explicitly keep .env.example trackable')
  }
}

function assertDeployScript(deploy) {
  const setVercelEnvNames = [
    ...deploy.matchAll(/setVercelEnv\(\s*['"]([^'"]+)['"]/g),
  ].map((match) => match[1])

  for (const name of setVercelEnvNames) {
    if (!allowedVercelProductionEnv.has(name)) {
      throw new Error(
        `deploy-production should not push ${name} to Vercel production env`,
      )
    }
  }

  for (const secretName of [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ACCESS_TOKEN',
  ]) {
    if (deploy.includes(secretName)) {
      throw new Error(
        `deploy-production should not require or mention ${secretName}`,
      )
    }
  }
}

function assertDocs(readme, deployment) {
  const readmeNeedles = [
    'secret key や service_role key は、`NEXT_PUBLIC_SUPABASE_ANON_KEY` に入れないでください',
    '`SUPABASE_SERVICE_ROLE_KEY` は管理用の強い鍵です',
  ]
  const deploymentNeedles = [
    'secret key や service_role key は、ブラウザへ公開される環境変数へ入れません',
    'Git には commit しません',
  ]

  for (const needle of readmeNeedles) {
    if (!readme.includes(needle)) {
      throw new Error(`README.md should keep env safety guidance: ${needle}`)
    }
  }

  for (const needle of deploymentNeedles) {
    if (!deployment.includes(needle)) {
      throw new Error(
        `DEPLOYMENT.md should keep env safety guidance: ${needle}`,
      )
    }
  }
}

function main() {
  const envExample = parseEnvExample(readProjectFile(files.envExample))
  const gitignore = readProjectFile(files.gitignore)
  const deploy = readProjectFile(files.deploy)
  const readme = readProjectFile(files.readme)
  const deployment = readProjectFile(files.deployment)

  assertEnvExample(envExample)
  assertGitignore(gitignore)
  assertDeployScript(deploy)
  assertDocs(readme, deployment)

  console.log('env safety check passed')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
