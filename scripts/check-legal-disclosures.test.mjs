import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-legal-disclosures.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-legal-disclosures-'))
}

function writeFile(cwd, file, text) {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function writeValidFiles(cwd, overrides = {}) {
  writeFile(
    cwd,
    'src/lib/legal.ts',
    overrides.legal ??
      [
        "export const LEGAL_LAST_UPDATED = '2026-05-26'",
        'export const legalLinks = [',
        "  { href: '/legal/terms', label: '利用規約' },",
        "  { href: '/legal/privacy', label: 'プライバシー' },",
        "  { href: '/legal/attributions', label: '画像クレジット' },",
        '] as const',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/legal/privacy/page.tsx',
    overrides.privacy ??
      [
        '保存データを JSON 形式で書き出したり、アプリ内の保存データを削除したりできます。',
        '削除対象は、表示名、好み、献立、在庫、常備品、固定枠、買い物リスト履歴です。',
        '認証アカウント自体の削除を希望する場合は、運営者に連絡してください。',
        '認証とデータ保存には Supabase を使います。',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/legal/terms/page.tsx',
    overrides.terms ??
      [
        '表示される献立は、医療・栄養指導・診断の代わりではありません。',
        'アレルギーや持病、妊娠中、食事制限がある場合は確認してください。',
        '法令や公序良俗に反する使い方を禁止します。',
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
  assert(result.status === 0, `valid legal disclosures should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('legal disclosures check passed'),
    'valid legal disclosures should print a pass message',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    legal: [
      "export const LEGAL_LAST_UPDATED = '2026-05-25'",
      "export const legalLinks = [{ href: '/legal/terms' }, { href: '/legal/privacy' }, { href: '/legal/attributions' }]",
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'stale legal date should fail')
  assert(
    result.stderr.includes('LEGAL_LAST_UPDATED should be 2026-05-26 or later'),
    'stale legal date failure should explain the minimum date',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    privacy: [
      '保存データを JSON 形式で書き出したりできます。',
      '認証とデータ保存には Supabase を使います。',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing delete disclosure should fail')
  assert(
    result.stderr.includes('privacy policy should disclose in-app data deletion'),
    'missing delete disclosure failure should explain the issue',
  )
})

console.log('legal disclosures self-test passed')
