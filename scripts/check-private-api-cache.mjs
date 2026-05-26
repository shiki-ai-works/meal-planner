import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  userDataConstants: 'src/lib/user-data.ts',
  generatePlanRoute: 'src/app/api/generate-plan/route.ts',
  assignRecipeRoute: 'src/app/api/assign-recipe/route.ts',
  weeklyLocksRoute: 'src/app/api/weekly-locks/[id]/route.ts',
  userDataExportRoute: 'src/app/api/user-data/export/route.ts',
  userDataDeleteRoute: 'src/app/api/user-data/delete/route.ts',
  publicE2E: 'scripts/e2e-public-flow.mjs',
  publicE2ETest: 'scripts/e2e-public-flow.test.mjs',
  authE2E: 'scripts/e2e-auth-flow.mjs',
}

const privateRoutes = [
  {
    file: files.generatePlanRoute,
    label: 'generate-plan route',
    headerSymbol: 'GENERATE_PLAN_RESPONSE_HEADERS',
  },
  {
    file: files.assignRecipeRoute,
    label: 'assign-recipe route',
    headerSymbol: 'ASSIGN_RECIPE_RESPONSE_HEADERS',
  },
  {
    file: files.weeklyLocksRoute,
    label: 'weekly-locks route',
    headerSymbol: 'WEEKLY_LOCKS_RESPONSE_HEADERS',
  },
  {
    file: files.userDataExportRoute,
    label: 'user-data export route',
    headerSymbol: 'USER_DATA_RESPONSE_HEADERS',
  },
  {
    file: files.userDataDeleteRoute,
    label: 'user-data delete route',
    headerSymbol: 'USER_DATA_RESPONSE_HEADERS',
  },
]

function readProjectFile(file) {
  const path = resolve(file)
  if (!existsSync(path)) {
    throw new Error(`Required file does not exist: ${file}`)
  }
  return readFileSync(path, 'utf8')
}

function assertIncludes(text, needle, message) {
  if (!text.includes(needle)) {
    throw new Error(message)
  }
}

function extractNextResponseJsonCalls(source) {
  const calls = []
  const needle = 'NextResponse.json('
  let index = 0

  while (index < source.length) {
    const start = source.indexOf(needle, index)
    if (start === -1) break

    const openParen = source.indexOf('(', start)
    let depth = 0
    let quote = null
    let escaped = false

    for (let i = openParen; i < source.length; i++) {
      const char = source[i]

      if (quote) {
        if (escaped) {
          escaped = false
        } else if (char === '\\') {
          escaped = true
        } else if (char === quote) {
          quote = null
        }
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char
        continue
      }
      if (char === '(') depth += 1
      if (char === ')') depth -= 1

      if (depth === 0) {
        calls.push(source.slice(start, i + 1))
        index = i + 1
        break
      }
    }

    if (index <= start) {
      throw new Error('Could not parse a NextResponse.json call')
    }
  }

  return calls
}

function assertEveryJsonResponseUsesHeader(source, route) {
  const calls = extractNextResponseJsonCalls(source)
  if (calls.length === 0) {
    throw new Error(`${route.label} should return JSON with NextResponse.json`)
  }

  for (const call of calls) {
    if (!call.includes('headers:') || !call.includes(route.headerSymbol)) {
      throw new Error(
        `${route.label} should use ${route.headerSymbol} in every NextResponse.json response`,
      )
    }
  }
}

function main() {
  const userDataConstants = readProjectFile(files.userDataConstants)
  const publicE2E = readProjectFile(files.publicE2E)
  const publicE2ETest = readProjectFile(files.publicE2ETest)
  const authE2E = readProjectFile(files.authE2E)

  assertIncludes(
    userDataConstants,
    'USER_DATA_RESPONSE_HEADERS',
    'user-data response headers should be centralized',
  )
  assertIncludes(
    userDataConstants,
    "'Cache-Control': 'no-store'",
    'user-data response headers should use Cache-Control: no-store',
  )

  for (const route of privateRoutes) {
    const source = readProjectFile(route.file)
    assertIncludes(
      source,
      route.headerSymbol,
      `${route.label} should define or import ${route.headerSymbol}`,
    )
    if (route.headerSymbol !== 'USER_DATA_RESPONSE_HEADERS') {
      assertIncludes(
        source,
        "'Cache-Control': 'no-store'",
        `${route.label} should keep a no-store cache header in scope`,
      )
    }
    assertEveryJsonResponseUsesHeader(source, route)
  }

  assertIncludes(
    publicE2E,
    "path === '/api/generate-plan'",
    'public E2E should expect no-store on generate-plan',
  )
  assertIncludes(
    publicE2E,
    "path === '/api/assign-recipe'",
    'public E2E should expect no-store on assign-recipe',
  )
  assertIncludes(
    publicE2E,
    "path.startsWith('/api/weekly-locks/')",
    'public E2E should expect no-store on weekly-locks',
  )
  assertIncludes(
    publicE2E,
    "path.startsWith('/api/user-data/')",
    'public E2E should expect no-store on user-data APIs',
  )
  assertIncludes(
    publicE2E,
    "headers['cache-control'] ??= 'no-store'",
    'public E2E should enforce Cache-Control: no-store for private APIs',
  )

  assertIncludes(
    publicE2ETest,
    'PRIVATE_API_HEADERS',
    'public E2E fixture should centralize private API headers',
  )
  assertIncludes(
    publicE2ETest,
    "pathname === '/api/generate-plan'",
    'public E2E fixture should cover generate-plan',
  )
  assertIncludes(
    publicE2ETest,
    "pathname === '/api/assign-recipe'",
    'public E2E fixture should cover assign-recipe',
  )
  assertIncludes(
    publicE2ETest,
    "pathname.startsWith('/api/weekly-locks/')",
    'public E2E fixture should cover weekly-locks',
  )
  assertIncludes(
    publicE2ETest,
    "pathname === '/api/user-data/export'",
    'public E2E fixture should cover user-data export',
  )
  assertIncludes(
    publicE2ETest,
    "pathname === '/api/user-data/delete'",
    'public E2E fixture should cover user-data delete',
  )

  assertIncludes(
    authE2E,
    "generate.headers.get('cache-control') !== 'no-store'",
    'auth E2E should verify no-store on generate-plan',
  )
  assertIncludes(
    authE2E,
    'POST /api/generate-plan did not return Cache-Control: no-store',
    'auth E2E should explain generate-plan no-store failures',
  )
  assertIncludes(
    authE2E,
    "assign.headers.get('cache-control') !== 'no-store'",
    'auth E2E should verify no-store on assign-recipe',
  )
  assertIncludes(
    authE2E,
    'POST /api/assign-recipe did not return Cache-Control: no-store',
    'auth E2E should explain assign-recipe no-store failures',
  )
  assertIncludes(
    authE2E,
    "exported.headers.get('cache-control') !== 'no-store'",
    'auth E2E should verify no-store on user-data export',
  )
  assertIncludes(
    authE2E,
    'GET /api/user-data/export did not return Cache-Control: no-store',
    'auth E2E should explain user-data export no-store failures',
  )

  console.log('private API cache check passed')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
