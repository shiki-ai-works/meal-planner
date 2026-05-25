import { createBrowserClient } from '@supabase/ssr'
import { assertSupabaseEnvConfigured, getSupabaseEnv } from './env'

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  assertSupabaseEnvConfigured()

  return createBrowserClient(url, anonKey)
}
