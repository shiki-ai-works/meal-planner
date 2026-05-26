import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-env-safety.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-env-safety-'))
}

function writeFile(cwd, file, text) {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function validEnvExample(overrides = {}) {
  return [
    `NEXT_PUBLIC_SUPABASE_URL=${overrides.NEXT_PUBLIC_SUPABASE_URL ?? 'your-supabase-project-url'}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${overrides.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'your-supabase-anon-key'}`,
    `SUPABASE_SERVICE_ROLE_KEY=${overrides.SUPABASE_SERVICE_ROLE_KEY ?? 'your-supabase-service-role-key'}`,
    '',
    '# Optional: production deployment from this workstation or CI.',
    `VERCEL_TOKEN=${overrides.VERCEL_TOKEN ?? 'your-vercel-token'}`,
    `VERCEL_ORG_ID=${overrides.VERCEL_ORG_ID ?? 'your-vercel-team-or-user-id'}`,
    `VERCEL_PROJECT_ID=${overrides.VERCEL_PROJECT_ID ?? 'your-vercel-project-id'}`,
    `VERCEL_PROJECT_NAME=${overrides.VERCEL_PROJECT_NAME ?? 'meal-planner'}`,
    `SUPABASE_ACCESS_TOKEN=${overrides.SUPABASE_ACCESS_TOKEN ?? 'your-supabase-access-token'}`,
    `PRODUCTION_URL=${overrides.PRODUCTION_URL ?? 'https://your-production-domain'}`,
    '',
  ].join('\n')
}

function validDeployScript(extra = '') {
  return [
    "const requiredKeys = ['VERCEL_TOKEN', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']",
    'async function setVercelEnv(name, value) {}',
    "await setVercelEnv('NEXT_PUBLIC_SUPABASE_URL', env.NEXT_PUBLIC_SUPABASE_URL)",
    "await setVercelEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', env.NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    extra,
    '',
  ].join('\n')
}

function writeValidFiles(cwd, overrides = {}) {
  writeFile(cwd, '.env.example', overrides.envExample ?? validEnvExample())
  writeFile(
    cwd,
    '.gitignore',
    overrides.gitignore ?? ['.env*', '!.env.example', ''].join('\n'),
  )
  writeFile(
    cwd,
    'scripts/deploy-production.mjs',
    overrides.deploy ?? validDeployScript(),
  )
  writeFile(
    cwd,
    'README.md',
    overrides.readme ??
      [
        'secret key や service_role key は、`NEXT_PUBLIC_SUPABASE_ANON_KEY` に入れないでください。',
        '`SUPABASE_SERVICE_ROLE_KEY` は管理用の強い鍵です。',
        '',
      ].join('\n'),
  )
  writeFile(
    cwd,
    'DEPLOYMENT.md',
    overrides.deployment ??
      [
        'secret key や service_role key は、ブラウザへ公開される環境変数へ入れません。',
        'token は CLI に渡す認証用の鍵です。Git には commit しません。',
        '',
      ].join('\n'),
  )
}

function runChecker(cwd) {
  return spawnSync(process.execPath, [checkerScript], {
    cwd,
    encoding: 'utf8',
  })
}

function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  try {
    run(cwd)
  } finally {
    rmSync(cwd, { force: true, recursive: true })
  }
}

withTempWorkspace((cwd) => {
  writeValidFiles(cwd)

  const result = runChecker(cwd)
  assert(result.status === 0, `valid env safety setup should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('env safety check passed'),
    'valid env safety setup should print a pass message',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    envExample: validEnvExample({
      NEXT_PUBLIC_SUPABASE_URL: 'https://real-project.supabase.co',
    }),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'real Supabase URL in .env.example should fail')
  assert(
    result.stderr.includes(
      '.env.example should keep NEXT_PUBLIC_SUPABASE_URL as placeholder',
    ),
    'real Supabase URL failure should explain the placeholder rule',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    envExample:
      validEnvExample() +
      'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role\n',
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'NEXT_PUBLIC secret-like key should fail')
  assert(
    result.stderr.includes('must not expose secret-like keys via NEXT_PUBLIC_'),
    'NEXT_PUBLIC secret-like key failure should explain the public prefix risk',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    deploy: validDeployScript(
      "await setVercelEnv('SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY)",
    ),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'deploying a service role key should fail')
  assert(
    result.stderr.includes(
      'deploy-production should not push SUPABASE_SERVICE_ROLE_KEY to Vercel production env',
    ),
    'service role deployment failure should explain the unsafe env push',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    gitignore: ['node_modules', ''].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing env ignore rule should fail')
  assert(
    result.stderr.includes('should ignore local env files with .env*'),
    'missing env ignore rule should explain the expected .gitignore rule',
  )
})

console.log('env safety self-test passed')
