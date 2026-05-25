import { NextResponse } from 'next/server'
import {
  getSupabaseSetupStatus,
  SUPABASE_SETUP_STATUS_CACHE_CONTROL,
} from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(getSupabaseSetupStatus(), {
    headers: {
      'Cache-Control': SUPABASE_SETUP_STATUS_CACHE_CONTROL,
    },
  })
}
