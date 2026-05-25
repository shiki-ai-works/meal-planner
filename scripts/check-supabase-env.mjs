import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const REQUIRED_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]
const DIAGNOSTIC_SCHEMA_VERSION = 1

const SUPABASE_URL_PLACEHOLDERS = new Set([
  'your-supabase-project-url',
  'https://your-project.supabase.co',
])

const SUPABASE_ANON_KEY_PLACEHOLDERS = new Set([
  'your-supabase-anon-key',
  'your-anon-key',
])

const ENV_FILE_ORDER = ['.env', '.env.development.local', '.env.local']
const NEXT_STEPS = [
  'Copy-Item .env.example .env.local',
  'Supabase Dashboard で Project URL と publishable key を確認する',
  '`.env.local` を更新したら開発サーバーを再起動する',
]
const KNOWN_ARGS = new Set(['--help', '-h', '--json', '--strict'])

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const isHelp = args.has('--help') || args.has('-h')
const isStrict = args.has('--strict')
const isJson = args.has('--json')
const unknownArgs = rawArgs.filter((arg) => !KNOWN_ARGS.has(arg))

function printHelp() {
  console.log(`Supabase setup doctor

Usage:
  npm run setup:doctor
  npm run setup:doctor:strict
  npm run --silent setup:doctor:json
  npm run setup:doctor:help

Options:
  --json     Print machine-readable JSON. Secrets are never printed.
  --strict   Exit with code 1 when setup is not ready.
  --help     Show this help.

Checks:
  - NEXT_PUBLIC_SUPABASE_URL is present, not a placeholder, and URL-shaped.
  - NEXT_PUBLIC_SUPABASE_ANON_KEY is present and not a placeholder.
  - .env.local overrides .env.development.local and .env.`)
}

function failUsage(message) {
  console.error(`Error: ${message}`)
  console.error('Run npm run setup:doctor:help to see supported options.')
  process.exit(1)
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

function parseEnvFile(fileName) {
  const filePath = resolve(fileName)

  if (!existsSync(filePath)) {
    return { exists: false, fileName, values: {} }
  }

  const values = {}
  const source = stripByteOrderMark(readFileSync(filePath, 'utf8'))

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue

    values[match[1]] = normalizeValue(match[2])
  }

  return { exists: true, fileName, values }
}

function loadLocalEnv() {
  const loadedFiles = ENV_FILE_ORDER.map(parseEnvFile)
  const values = {}
  const sources = {}

  for (const file of loadedFiles) {
    if (!file.exists) continue

    for (const [key, value] of Object.entries(file.values)) {
      values[key] = value
      sources[key] = file.fileName
    }
  }

  return { loadedFiles, sources, values }
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function getIssues(values) {
  const url = values.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const anonKey = values.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''
  const issues = []

  if (!url) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      message: 'Project URL が未設定です。',
    })
  } else if (SUPABASE_URL_PLACEHOLDERS.has(url)) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      message:
        '`.env.example` の仮 URL のままです。Supabase Dashboard の Project URL に置き換えてください。',
    })
  } else if (!isValidUrl(url)) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      message: '`https://...` または `http://...` で始まる URL を入れてください。',
    })
  }

  if (!anonKey) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      message: '公開用 key が未設定です。',
    })
  } else if (SUPABASE_ANON_KEY_PLACEHOLDERS.has(anonKey)) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      message:
        '`.env.example` の仮 key のままです。publishable key、または legacy anon key に置き換えてください。',
    })
  }

  return issues
}

function getMissingKeys(values) {
  return REQUIRED_KEYS.filter((key) => !values[key]?.trim())
}

function getStatus(values) {
  const issues = getIssues(values)
  const missingKeys = getMissingKeys(values)

  return {
    ok: issues.length === 0,
    status:
      issues.length === 0 ? 'ready' : missingKeys.length === 0 ? 'check' : 'required',
    issues,
    missingKeys,
  }
}

function formatLoadedFile(file) {
  return `- ${file.fileName}: ${file.exists ? 'found' : 'missing'}`
}

function formatKeySource(key, sources) {
  return `- ${key}: ${sources[key] ?? 'not found'}`
}

function buildReport() {
  const { loadedFiles, sources, values } = loadLocalEnv()
  const result = getStatus(values)

  return {
    diagnosticSchemaVersion: DIAGNOSTIC_SCHEMA_VERSION,
    ok: result.ok,
    status: result.status,
    setupPath: '/setup',
    requiredKeys: REQUIRED_KEYS,
    envFiles: loadedFiles.map((file) => ({
      fileName: file.fileName,
      exists: file.exists,
    })),
    requiredKeySources: Object.fromEntries(
      REQUIRED_KEYS.map((key) => [key, sources[key] ?? null]),
    ),
    missingKeys: result.missingKeys,
    issues: result.issues,
    nextSteps: result.ok ? [] : NEXT_STEPS,
  }
}

function printJsonReport(report) {
  console.log(JSON.stringify(report, null, 2))
}

function printTextReport(report) {
  console.log('Supabase setup doctor')
  console.log(`Status: ${report.status}${report.ok ? ' (ready)' : ''}`)
  console.log('')
  console.log('Env files:')
  console.log(report.envFiles.map(formatLoadedFile).join('\n'))
  console.log('')
  console.log('Required key sources:')
  console.log(
    REQUIRED_KEYS.map((key) =>
      formatKeySource(key, report.requiredKeySources),
    ).join('\n'),
  )

  if (report.issues.length > 0) {
    console.log('')
    console.log('Issues:')
    for (const issue of report.issues) {
      console.log(`- ${issue.key}: ${issue.message}`)
    }
    console.log('')
    console.log('Next steps:')
    for (const nextStep of report.nextSteps) {
      console.log(`- ${nextStep}`)
    }
  } else {
    console.log('')
    console.log('OK: Supabase の公開 URL と公開 key は設定済みです。')
  }
}

if (isHelp) {
  printHelp()
  process.exit(0)
}

if (unknownArgs.length > 0) {
  failUsage(`unknown option: ${unknownArgs.join(', ')}`)
}

const report = buildReport()

if (isJson) {
  printJsonReport(report)
} else {
  printTextReport(report)
}

if (!report.ok && isStrict) {
  process.exitCode = 1
}
