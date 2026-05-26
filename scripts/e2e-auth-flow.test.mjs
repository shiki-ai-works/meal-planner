import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const e2eScript = resolve(projectRoot, 'scripts/e2e-auth-flow.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function formatResult(result) {
  return [
    `status: ${result.status}`,
    `stdout:\n${result.stdout}`,
    `stderr:\n${result.stderr}`,
  ].join('\n')
}

function safeBaseEnv() {
  return {
    PATH: process.env.PATH ?? '',
    SystemRoot: process.env.SystemRoot ?? '',
    WINDIR: process.env.WINDIR ?? '',
  }
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-auth-e2e-'))
}

async function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  try {
    await run(cwd)
  } finally {
    rmSync(cwd, { force: true, recursive: true })
  }
}

function runE2e(env = {}, cwd = projectRoot) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [e2eScript], {
      cwd,
      env: {
        ...safeBaseEnv(),
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('close', (status) => {
      resolvePromise({ status, stdout, stderr })
    })
  })
}

{
  const result = await runE2e()

  assert(result.status === 1, 'auth E2E should fail without env')
  assert(
    result.stderr.includes('NEXT_PUBLIC_SUPABASE_URL is required for auth E2E'),
    `missing env error should mention NEXT_PUBLIC_SUPABASE_URL\n${formatResult(result)}`,
  )
  assert(
    result.stderr.includes('do not commit credentials'),
    'missing env error should warn not to commit credentials',
  )
}

await withTempWorkspace(async (cwd) => {
  const result = await runE2e(
    {
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_fake_value',
      E2E_AUTH_EMAIL: 'test@example.com',
      E2E_AUTH_PASSWORD: 'password123',
    },
    cwd,
  )

  assert(result.status === 1, 'auth E2E should fail without a local production build')
  assert(
    result.stderr.includes('Missing production build: .next/BUILD_ID'),
    `missing build error should mention .next/BUILD_ID\n${formatResult(result)}`,
  )
  assert(
    result.stderr.includes('Run npm.cmd run build before npm.cmd run e2e:auth.'),
    'missing build error should point to the build command',
  )
})

{
  const result = await runE2e({
    E2E_AUTH_MODE: 'bad',
    NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_fake_value',
    E2E_AUTH_EMAIL: 'test@example.com',
    E2E_AUTH_PASSWORD: 'password123',
    E2E_BASE_URL: 'http://127.0.0.1:9',
  })

  assert(result.status === 1, 'invalid mode should fail')
  assert(
    result.stderr.includes('E2E_AUTH_MODE must be either login or signup'),
    `invalid mode error should be explicit\n${formatResult(result)}`,
  )
}

console.log('auth E2E self-test passed')
