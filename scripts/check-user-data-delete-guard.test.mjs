import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-user-data-delete-guard.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-delete-guard-'))
}

function writeFile(cwd, file, text) {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function writeValidFiles(cwd, overrides = {}) {
  writeFile(
    cwd,
    'src/lib/user-data.ts',
    overrides.constants ??
      [
        "export const USER_DATA_DELETE_CONFIRMATION = '削除'",
        'export const USER_DATA_DELETE_CONFIRMATION_HEADER =',
        "  'x-meal-planner-delete-confirmation'",
        "export const USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE = 'delete-confirmed'",
        'export const USER_DATA_RESPONSE_HEADERS = {',
        "  'Cache-Control': 'no-store',",
        '}',
        '',
        'export function hasUserDataDeleteConfirmation(headers: Headers) {',
        '  return headers.get(USER_DATA_DELETE_CONFIRMATION_HEADER)?.trim() === USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE',
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/api/user-data/delete/route.ts',
    overrides.route ??
      [
        "import { USER_DATA_RESPONSE_HEADERS, hasUserDataDeleteConfirmation } from '@/lib/user-data'",
        "import { createClient } from '@/lib/supabase/server'",
        '',
        'export async function DELETE(request: Request) {',
        '  if (!hasUserDataDeleteConfirmation(request.headers)) {',
        '    return Response.json({ error: "missing" }, { status: 400 })',
        '  }',
        '  const supabase = await createClient()',
        '  return Response.json({ ok: true, supabase })',
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/(main)/settings/DataControlsClient.tsx',
    overrides.client ??
      [
        "import { USER_DATA_DELETE_CONFIRMATION, USER_DATA_DELETE_CONFIRMATION_HEADER, USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE } from '@/lib/user-data'",
        '',
        'const CONFIRM_TEXT = USER_DATA_DELETE_CONFIRMATION',
        '',
        'export function DataControlsClient() {',
        '  function handleDelete() {',
        '    if (confirmText !== CONFIRM_TEXT) return',
        "    fetch('/api/user-data/delete', {",
        "      method: 'DELETE',",
        '      headers: {',
        '        [USER_DATA_DELETE_CONFIRMATION_HEADER]: USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE,',
        '      },',
        '    })',
        '  }',
        '  return null',
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
  assert(result.status === 0, `valid guard wiring should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('user data delete guard check passed'),
    'valid guard wiring should print a pass message',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    route: [
      "import { USER_DATA_RESPONSE_HEADERS, hasUserDataDeleteConfirmation } from '@/lib/user-data'",
      "import { createClient } from '@/lib/supabase/server'",
      '',
      'export async function DELETE(request: Request) {',
      '  const supabase = await createClient()',
      '  if (!hasUserDataDeleteConfirmation(request.headers)) {',
      '    return Response.json({ error: "missing" }, { status: 400 })',
      '  }',
      '  return Response.json({ ok: true, supabase })',
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'guard after createClient should fail')
  assert(
    result.stderr.includes('before creating the Supabase client'),
    'guard ordering failure should explain the expected order',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    client: [
      "import { USER_DATA_DELETE_CONFIRMATION, USER_DATA_DELETE_CONFIRMATION_HEADER, USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE } from '@/lib/user-data'",
      '',
      'const CONFIRM_TEXT = USER_DATA_DELETE_CONFIRMATION',
      '',
      'export function DataControlsClient() {',
      '  function handleDelete() {',
      '    if (confirmText !== CONFIRM_TEXT) return',
      "    fetch('/api/user-data/delete', { method: 'DELETE' })",
      '  }',
      '  return null',
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'client without confirmation header should fail')
  assert(
    result.stderr.includes('should send the delete confirmation header'),
    'client missing header failure should explain the issue',
  )
})

console.log('user data delete guard self-test passed')
