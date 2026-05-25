export const SUPABASE_REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

export type SupabaseEnvKey = (typeof SUPABASE_REQUIRED_ENV_KEYS)[number]

export type SupabaseSetupStatus = 'required' | 'check' | 'ready'

export interface SupabaseEnvIssue {
  key: SupabaseEnvKey
  message: string
}

export interface SupabaseSetupStatusResult {
  diagnosticSchemaVersion: typeof SUPABASE_SETUP_DIAGNOSTIC_SCHEMA_VERSION
  ok: boolean
  status: SupabaseSetupStatus
  requiredKeys: SupabaseEnvKey[]
  issues: SupabaseEnvIssue[]
  missingKeys: SupabaseEnvKey[]
  setupPath: '/setup'
}

export const SUPABASE_SETUP_DIAGNOSTIC_SCHEMA_VERSION = 1
export const SUPABASE_SETUP_STATUS_CACHE_CONTROL = 'no-store'

const SUPABASE_URL_PLACEHOLDERS = new Set([
  'your-supabase-project-url',
  'https://your-project.supabase.co',
])

const SUPABASE_ANON_KEY_PLACEHOLDERS = new Set([
  'your-supabase-anon-key',
  'your-anon-key',
])

function cleanEnvValue(value: string | undefined) {
  return value?.trim() ?? ''
}

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function getSupabaseEnv() {
  return {
    url: cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }
}

export function hasSupabaseEnv() {
  return getSupabaseEnvIssues().length === 0
}

export function assertSupabaseEnvConfigured() {
  const issues = getSupabaseEnvIssues()
  if (issues.length > 0) {
    throw new Error('Supabase environment variables are not configured')
  }
}

export function getMissingSupabaseEnvKeys(): SupabaseEnvKey[] {
  const { url, anonKey } = getSupabaseEnv()
  return SUPABASE_REQUIRED_ENV_KEYS.filter((key) => {
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') return !url
    return !anonKey
  })
}

export function getSupabaseSetupStatus(): SupabaseSetupStatusResult {
  const issues = getSupabaseEnvIssues()
  const missingKeys = getMissingSupabaseEnvKeys()
  const status: SupabaseSetupStatus =
    issues.length === 0 ? 'ready' : missingKeys.length === 0 ? 'check' : 'required'

  return {
    diagnosticSchemaVersion: SUPABASE_SETUP_DIAGNOSTIC_SCHEMA_VERSION,
    ok: issues.length === 0,
    status,
    requiredKeys: [...SUPABASE_REQUIRED_ENV_KEYS],
    issues,
    missingKeys,
    setupPath: '/setup',
  }
}

export function getSupabaseEnvIssues(): SupabaseEnvIssue[] {
  const { url, anonKey } = getSupabaseEnv()
  const issues: SupabaseEnvIssue[] = []

  if (!url) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      message: 'Project URL が未設定です。',
    })
  } else if (SUPABASE_URL_PLACEHOLDERS.has(url)) {
    issues.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      message: '`.env.example` の仮 URL のままです。Supabase Dashboard の Project URL に置き換えてください。',
    })
  } else if (!isValidSupabaseUrl(url)) {
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
      message: '`.env.example` の仮 key のままです。publishable key、または legacy anon key に置き換えてください。',
    })
  }

  return issues
}
