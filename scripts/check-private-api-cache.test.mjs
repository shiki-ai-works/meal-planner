import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-private-api-cache.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-private-api-cache-'))
}

function writeFile(cwd, file, text) {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function routeFixture(headerSymbol) {
  return [
    `const ${headerSymbol} = {`,
    "  'Cache-Control': 'no-store',",
    '}',
    '',
    'export async function POST() {',
    `  return NextResponse.json({ ok: true }, { status: 200, headers: ${headerSymbol} })`,
    '}',
    '',
  ].join('\n')
}

function writeValidFiles(cwd, overrides = {}) {
  writeFile(
    cwd,
    'src/lib/user-data.ts',
    overrides.userDataConstants ??
      [
        'export const USER_DATA_RESPONSE_HEADERS = {',
        "  'Cache-Control': 'no-store',",
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/api/generate-plan/route.ts',
    overrides.generatePlanRoute ?? routeFixture('GENERATE_PLAN_RESPONSE_HEADERS'),
  )
  writeFile(
    cwd,
    'src/app/api/assign-recipe/route.ts',
    overrides.assignRecipeRoute ?? routeFixture('ASSIGN_RECIPE_RESPONSE_HEADERS'),
  )
  writeFile(
    cwd,
    'src/app/api/weekly-locks/[id]/route.ts',
    overrides.weeklyLocksRoute ?? routeFixture('WEEKLY_LOCKS_RESPONSE_HEADERS'),
  )
  writeFile(
    cwd,
    'src/app/api/user-data/export/route.ts',
    overrides.userDataExportRoute ??
      [
        "import { USER_DATA_RESPONSE_HEADERS } from '@/lib/user-data'",
        "const local = 'Cache-Control': 'no-store'",
        'export async function GET() {',
        '  return NextResponse.json({ ok: true }, { headers: USER_DATA_RESPONSE_HEADERS })',
        '}',
        '',
      ].join('\n'),
  )
  writeFile(
    cwd,
    'src/app/api/user-data/delete/route.ts',
    overrides.userDataDeleteRoute ??
      [
        "import { USER_DATA_RESPONSE_HEADERS } from '@/lib/user-data'",
        "const local = 'Cache-Control': 'no-store'",
        'export async function DELETE() {',
        '  return NextResponse.json({ ok: true }, { headers: USER_DATA_RESPONSE_HEADERS })',
        '}',
        '',
      ].join('\n'),
  )
  writeFile(
    cwd,
    'scripts/e2e-public-flow.mjs',
    overrides.publicE2E ??
      [
        'function expectedApiHeaders(path, expectedHeaders = {}) {',
        '  const headers = { ...expectedHeaders }',
        '  if (',
        "    path === '/api/generate-plan' ||",
        "    path === '/api/assign-recipe' ||",
        "    path.startsWith('/api/weekly-locks/') ||",
        "    path.startsWith('/api/user-data/')",
        '  ) {',
        "    headers['cache-control'] ??= 'no-store'",
        '  }',
        '  return headers',
        '}',
        '',
      ].join('\n'),
  )
  writeFile(
    cwd,
    'scripts/e2e-public-flow.test.mjs',
    overrides.publicE2ETest ??
      [
        "const PRIVATE_API_HEADERS = { 'cache-control': 'no-store' }",
        'function routeApiResponse(request) {',
        "  const pathname = new URL(request.url, 'http://fixture.local').pathname",
        "  if (pathname === '/api/generate-plan') return { headers: PRIVATE_API_HEADERS }",
        "  if (pathname === '/api/assign-recipe') return { headers: PRIVATE_API_HEADERS }",
        "  if (pathname.startsWith('/api/weekly-locks/')) return { headers: PRIVATE_API_HEADERS }",
        "  if (pathname === '/api/user-data/export') return { headers: PRIVATE_API_HEADERS }",
        "  if (pathname === '/api/user-data/delete') return { headers: PRIVATE_API_HEADERS }",
        '}',
        '',
      ].join('\n'),
  )
  writeFile(
    cwd,
    'scripts/e2e-auth-flow.mjs',
    overrides.authE2E ??
      [
        "if (generate.headers.get('cache-control') !== 'no-store') {",
        "  throw new Error('POST /api/generate-plan did not return Cache-Control: no-store')",
        '}',
        "if (assign.headers.get('cache-control') !== 'no-store') {",
        "  throw new Error('POST /api/assign-recipe did not return Cache-Control: no-store')",
        '}',
        "if (exported.headers.get('cache-control') !== 'no-store') {",
        "  throw new Error('GET /api/user-data/export did not return Cache-Control: no-store')",
        '}',
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
  assert(result.status === 0, `valid private API cache wiring should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('private API cache check passed'),
    'valid private API cache wiring should print a pass message',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    generatePlanRoute: [
      "const GENERATE_PLAN_RESPONSE_HEADERS = { 'Cache-Control': 'no-store' }",
      'export async function POST() {',
      "  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'generate-plan response without headers should fail')
  assert(
    result.stderr.includes('generate-plan route should use GENERATE_PLAN_RESPONSE_HEADERS'),
    'missing generate-plan header failure should explain the route',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    publicE2E: [
      'function expectedApiHeaders(path, expectedHeaders = {}) {',
      '  const headers = { ...expectedHeaders }',
      '  if (',
      "    path === '/api/generate-plan' ||",
      "    path === '/api/assign-recipe' ||",
      "    path.startsWith('/api/user-data/')",
      '  ) {',
      "    headers['cache-control'] ??= 'no-store'",
      '  }',
      '  return headers',
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing public E2E weekly-locks cache coverage should fail')
  assert(
    result.stderr.includes('public E2E should expect no-store on weekly-locks'),
    'missing public E2E coverage failure should explain weekly-locks',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    userDataConstants: [
      'export const USER_DATA_RESPONSE_HEADERS = {',
      "  'Cache-Control': 'public, max-age=3600',",
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'cacheable user-data header should fail')
  assert(
    result.stderr.includes('user-data response headers should use Cache-Control: no-store'),
    'cacheable user-data header failure should explain the expected no-store value',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    authE2E: [
      "if (generate.headers.get('cache-control') !== 'no-store') {",
      "  throw new Error('POST /api/generate-plan did not return Cache-Control: no-store')",
      '}',
      "if (assign.headers.get('cache-control') !== 'no-store') {",
      "  throw new Error('POST /api/assign-recipe did not return Cache-Control: no-store')",
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing auth E2E user-data cache coverage should fail')
  assert(
    result.stderr.includes('auth E2E should verify no-store on user-data export'),
    'missing auth E2E coverage failure should explain user-data export',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    authE2E: [
      "if (assign.headers.get('cache-control') !== 'no-store') {",
      "  throw new Error('POST /api/assign-recipe did not return Cache-Control: no-store')",
      '}',
      "if (exported.headers.get('cache-control') !== 'no-store') {",
      "  throw new Error('GET /api/user-data/export did not return Cache-Control: no-store')",
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing auth E2E generate-plan cache coverage should fail')
  assert(
    result.stderr.includes('auth E2E should verify no-store on generate-plan'),
    'missing auth E2E coverage failure should explain generate-plan',
  )
})

console.log('private API cache self-test passed')
