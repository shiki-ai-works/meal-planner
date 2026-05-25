import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  getSupabaseEnv,
  getSupabaseSetupStatus,
  SUPABASE_SETUP_STATUS_CACHE_CONTROL,
} from './env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl
  const isApiPath = pathname.startsWith('/api')
  const isSetupStatusApi = pathname === '/api/setup-status'
  const isPublicPage = pathname === '/setup' || pathname.startsWith('/demo')
  const isPublicRequest = isPublicPage || isSetupStatusApi
  const supabaseSetupStatus = getSupabaseSetupStatus()

  if (!supabaseSetupStatus.ok) {
    if (isApiPath && !isSetupStatusApi) {
      return NextResponse.json(
        {
          error: 'Supabase environment variables are not configured',
          ...supabaseSetupStatus,
        },
        {
          status: 503,
          headers: {
            'Cache-Control': SUPABASE_SETUP_STATUS_CACHE_CONTROL,
          },
        },
      )
    }

    if (!isPublicRequest) {
      const url = request.nextUrl.clone()
      url.pathname = supabaseSetupStatus.setupPath
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  const { url, anonKey } = getSupabaseEnv()

  if (isApiPath) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未認証ユーザーをログイン画面へリダイレクト
  if (
    !user &&
    !isPublicRequest &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーをダッシュボードへ
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
