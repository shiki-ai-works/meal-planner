import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  constants: 'src/lib/user-data.ts',
  route: 'src/app/api/user-data/delete/route.ts',
  client: 'src/app/(main)/settings/DataControlsClient.tsx',
}

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

function assertBefore(text, first, second, message) {
  const firstIndex = text.indexOf(first)
  const secondIndex = text.indexOf(second)

  if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
    throw new Error(message)
  }
}

function main() {
  const constants = readProjectFile(files.constants)
  const route = readProjectFile(files.route)
  const client = readProjectFile(files.client)

  assertIncludes(
    constants,
    "USER_DATA_DELETE_CONFIRMATION = '削除'",
    'delete confirmation text should be centralized in src/lib/user-data.ts',
  )
  assertIncludes(
    constants,
    "USER_DATA_DELETE_CONFIRMATION_HEADER =\n  'x-meal-planner-delete-confirmation'",
    'delete confirmation header should be centralized in src/lib/user-data.ts',
  )
  assertIncludes(
    constants,
    "USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE = 'delete-confirmed'",
    'delete confirmation header value should be ASCII-safe',
  )
  assertIncludes(
    constants,
    'hasUserDataDeleteConfirmation(headers: Headers)',
    'delete confirmation helper should be exported',
  )
  assertIncludes(
    constants,
    'USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE',
    'delete confirmation helper should compare against the shared header value',
  )
  assertIncludes(
    constants,
    'USER_DATA_RESPONSE_HEADERS',
    'user data response headers should be centralized in src/lib/user-data.ts',
  )
  assertIncludes(
    constants,
    "'Cache-Control': 'no-store'",
    'user data response headers should prevent cache storage',
  )

  assertIncludes(
    route,
    'USER_DATA_RESPONSE_HEADERS',
    'delete route should import the shared no-store response headers',
  )
  assertIncludes(
    route,
    'hasUserDataDeleteConfirmation',
    'delete route should import the confirmation helper',
  )
  assertIncludes(
    route,
    'export async function DELETE(request: Request)',
    'delete route should receive the Request object',
  )
  assertBefore(
    route,
    'hasUserDataDeleteConfirmation(request.headers)',
    'createClient()',
    'delete route should verify confirmation header before creating the Supabase client',
  )
  assertIncludes(
    route,
    'status: 400',
    'delete route should reject missing confirmation header with a client error',
  )

  assertIncludes(
    client,
    'USER_DATA_DELETE_CONFIRMATION_HEADER',
    'settings data controls should import the delete confirmation header',
  )
  assertIncludes(
    client,
    'USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE',
    'settings data controls should import the ASCII-safe delete confirmation header value',
  )
  assertIncludes(
    client,
    'const CONFIRM_TEXT = USER_DATA_DELETE_CONFIRMATION',
    'settings data controls should use the shared delete confirmation text',
  )
  assertIncludes(
    client,
    '[USER_DATA_DELETE_CONFIRMATION_HEADER]:',
    'settings data controls should send the delete confirmation header',
  )
  assertIncludes(
    client,
    'USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE',
    'settings data controls should send the ASCII-safe delete confirmation header value',
  )
  assertBefore(
    client,
    'if (confirmText !== CONFIRM_TEXT) return',
    "fetch('/api/user-data/delete'",
    'settings data controls should check the confirmation text before calling delete',
  )

  console.log('user data delete guard check passed')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
