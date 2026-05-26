import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const minLegalDate = '2026-05-26'
const files = {
  legal: 'src/lib/legal.ts',
  privacy: 'src/app/legal/privacy/page.tsx',
  terms: 'src/app/legal/terms/page.tsx',
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

function assertLegalDate(legal) {
  const match = /LEGAL_LAST_UPDATED\s*=\s*'(\d{4}-\d{2}-\d{2})'/.exec(legal)
  if (!match) {
    throw new Error('LEGAL_LAST_UPDATED should be a YYYY-MM-DD string')
  }
  if (match[1] < minLegalDate) {
    throw new Error(`LEGAL_LAST_UPDATED should be ${minLegalDate} or later`)
  }
}

function main() {
  const legal = readProjectFile(files.legal)
  const privacy = readProjectFile(files.privacy)
  const terms = readProjectFile(files.terms)

  assertLegalDate(legal)

  for (const href of ['/legal/terms', '/legal/privacy', '/legal/attributions']) {
    assertIncludes(legal, `href: '${href}'`, `legalLinks should include ${href}`)
  }

  assertIncludes(
    privacy,
    '保存データを JSON 形式で書き出したり',
    'privacy policy should disclose JSON export',
  )
  assertIncludes(
    privacy,
    'アプリ内の保存データを削除したりできます',
    'privacy policy should disclose in-app data deletion',
  )
  assertIncludes(
    privacy,
    '削除対象は、表示名、好み、献立、在庫、常備品、固定枠、買い物リスト履歴です',
    'privacy policy should list deleted application data categories',
  )
  assertIncludes(
    privacy,
    '認証アカウント自体の削除を希望する場合',
    'privacy policy should distinguish auth account deletion from app data deletion',
  )
  assertIncludes(
    privacy,
    '認証とデータ保存には Supabase を使います',
    'privacy policy should disclose Supabase usage',
  )

  assertIncludes(
    terms,
    '医療・栄養指導・診断の代わりではありません',
    'terms should keep the medical/nutrition disclaimer',
  )
  assertIncludes(
    terms,
    'アレルギーや持病、妊娠中、食事制限がある場合',
    'terms should keep allergy and health-condition safety guidance',
  )
  assertIncludes(
    terms,
    '法令や公序良俗に反する使い方を禁止します',
    'terms should keep prohibited-use language',
  )

  console.log('legal disclosures check passed')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
