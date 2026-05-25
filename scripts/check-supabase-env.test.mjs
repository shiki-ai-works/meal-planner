import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const doctorScript = resolve(projectRoot, 'scripts/check-supabase-env.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-setup-doctor-'))
}

function runDoctor(cwd, args = []) {
  return spawnSync(process.execPath, [doctorScript, ...args], {
    cwd,
    encoding: 'utf8',
  })
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout)
  } catch (error) {
    fail(`stdout is not valid JSON: ${error.message}\n${stdout}`)
  }
}

function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  try {
    run(cwd)
  } finally {
    rmSync(cwd, { force: true, recursive: true })
  }
}

function expectJsonDoesNotLeakValues(stdout) {
  assert(
    !stdout.includes('https://project.supabase.co'),
    'JSON output leaked Supabase URL value',
  )
  assert(
    !stdout.includes('sb_publishable_fake_value'),
    'JSON output leaked anon key value',
  )
}

withTempWorkspace((cwd) => {
  const result = runDoctor(cwd, ['--json'])
  assert(result.status === 0, 'missing-env JSON run should exit 0')

  const report = parseJson(result.stdout)
  assert(report.diagnosticSchemaVersion === 1, 'schema version should be 1')
  assert(
    report.requiredKeys.includes('NEXT_PUBLIC_SUPABASE_URL'),
    'required keys should include URL',
  )
  assert(
    report.requiredKeys.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    'required keys should include anon key',
  )
  assert(report.ok === false, 'missing env should not be ok')
  assert(report.status === 'required', 'missing env should be required')
  assert(
    report.missingKeys.includes('NEXT_PUBLIC_SUPABASE_URL'),
    'missing env should report missing URL',
  )
  assert(
    report.missingKeys.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    'missing env should report missing anon key',
  )
})

withTempWorkspace((cwd) => {
  writeFileSync(
    resolve(cwd, '.env.local'),
    [
      'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
      '',
    ].join('\n'),
  )

  const result = runDoctor(cwd, ['--json'])
  assert(result.status === 0, 'placeholder JSON run should exit 0')

  const report = parseJson(result.stdout)
  assert(report.ok === false, 'placeholder env should not be ok')
  assert(report.status === 'check', 'placeholder env should be check')
  assert(report.missingKeys.length === 0, 'placeholder env should not be missing')
  assert(
    report.requiredKeySources.NEXT_PUBLIC_SUPABASE_URL === '.env.local',
    'placeholder URL source should be .env.local',
  )
})

withTempWorkspace((cwd) => {
  writeFileSync(
    resolve(cwd, '.env'),
    [
      'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
      '',
    ].join('\n'),
  )
  writeFileSync(
    resolve(cwd, '.env.local'),
    [
      'NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fake_value',
      '',
    ].join('\n'),
  )

  const result = runDoctor(cwd, ['--json'])
  assert(result.status === 0, 'ready JSON run should exit 0')
  expectJsonDoesNotLeakValues(result.stdout)

  const report = parseJson(result.stdout)
  assert(report.ok === true, 'valid env should be ok')
  assert(report.status === 'ready', 'valid env should be ready')
  assert(report.issues.length === 0, 'valid env should have no issues')
  assert(
    report.requiredKeySources.NEXT_PUBLIC_SUPABASE_URL === '.env.local',
    '.env.local should override .env for URL',
  )
})

withTempWorkspace((cwd) => {
  const result = runDoctor(cwd, ['--strict', '--json'])
  assert(result.status === 1, 'strict missing-env run should exit 1')

  const report = parseJson(result.stdout)
  assert(report.status === 'required', 'strict JSON should still print report')
})

withTempWorkspace((cwd) => {
  const result = runDoctor(cwd, ['--unknown'])
  assert(result.status === 1, 'unknown option should exit 1')
  assert(
    result.stderr.includes('unknown option: --unknown'),
    'unknown option should explain the invalid option',
  )
})

withTempWorkspace((cwd) => {
  const result = runDoctor(cwd, ['--help'])
  assert(result.status === 0, 'help should exit 0')
  assert(result.stdout.includes('Usage:'), 'help should include Usage')
  assert(result.stdout.includes('--json'), 'help should mention --json')
  assert(result.stdout.includes('--strict'), 'help should mention --strict')
})

console.log('setup doctor self-test passed')
