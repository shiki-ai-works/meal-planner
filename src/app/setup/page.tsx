import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { legalLinks } from '@/lib/legal'
import { isUserOnboarded } from '@/lib/onboarding'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseSetupStatus } from '@/lib/supabase/env'
import { getMondayISO } from '@/lib/week-plan'
import type { DbUser } from '@/types/database'
import { OnboardingClient } from './OnboardingClient'

const SUPABASE_DASHBOARD_URL = 'https://supabase.com/dashboard/projects'
const SUPABASE_API_KEYS_DOC_URL =
  'https://supabase.com/docs/guides/getting-started/api-keys'

function isSupabaseAuthCookie(name: string) {
  return name.startsWith('sb-') && name.includes('auth-token')
}

export default async function SetupPage() {
  await connection()

  const setupState = getSupabaseSetupStatus()
  const envIssues = setupState.issues
  const isConfigured = setupState.ok
  const hasPlaceholderOrInvalidValues = setupState.status === 'check'
  const setupStatus = isConfigured
    ? 'SETUP READY'
    : hasPlaceholderOrInvalidValues
      ? 'SETUP CHECK'
      : 'SETUP REQUIRED'
  const setupTitle = isConfigured
    ? 'Supabase 接続設定は揃っています'
    : hasPlaceholderOrInvalidValues
      ? 'Supabase 接続設定を確認してください'
      : 'Supabase 接続設定が必要です'
  const setupDescription = isConfigured
    ? 'アプリは起動しており、必要な環境変数も見つかりました。認証画面からログインして、実データの献立管理へ進めます。'
    : hasPlaceholderOrInvalidValues
      ? '環境変数は入っていますが、仮値または読み取れない形式が残っています。Supabase Dashboard の値へ置き換えてから開発サーバーを再起動してください。'
      : 'アプリは起動しています。今はデータベース接続の鍵が未設定なので、認証・献立・在庫などの画面へ進む前に `.env.local` を用意してください。'

  const cookieStore = await cookies()
  const hasAuthCookie = cookieStore.getAll().some((cookie) =>
    isSupabaseAuthCookie(cookie.name),
  )

  if (isConfigured && hasAuthCookie) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      const dbUser = (data ?? null) as DbUser | null

      if (!isUserOnboarded(dbUser)) {
        return (
          <OnboardingClient
            email={user.email ?? ''}
            initialUser={dbUser}
            weekStartDate={getMondayISO(new Date())}
          />
        )
      }

      redirect('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <section className="hud-border bg-card p-5">
          <p className="mb-2 text-xs font-bold text-accent">
            {setupStatus}
          </p>
          <h1 className="text-xl font-bold">{setupTitle}</h1>
          <p className="mt-3 text-sm text-muted">
            {setupDescription}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={isConfigured ? '/login' : '/demo'}
              className="inline-flex min-h-10 items-center rounded bg-accent px-4 py-2 text-xs font-bold text-white"
            >
              {isConfigured ? 'ログインへ進む' : 'デモを見る'}
            </Link>
            {isConfigured ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-10 items-center rounded border border-card-border bg-white px-4 py-2 text-xs font-bold text-muted hover:border-accent hover:text-accent"
              >
                ダッシュボードを開く
              </Link>
            ) : null}
            <a
              href="/api/setup-status"
              className="inline-flex min-h-10 items-center rounded border border-card-border bg-white px-4 py-2 text-xs font-bold text-muted hover:border-accent hover:text-accent"
            >
              診断JSONを見る
            </a>
          </div>
        </section>

        <section className="hud-border bg-card p-5">
          <h2 className="text-sm font-bold">
            {isConfigured ? 'Supabase の鍵を見直す場所' : 'Supabase の鍵を手に入れる流れ'}
          </h2>
          <ol className="mt-3 flex flex-col gap-3 text-sm">
            <li className="rounded border border-card-border bg-background px-3 py-3">
              <span className="block text-xs font-bold text-accent">1. プロジェクトを開く</span>
              <p className="mt-1 text-xs text-muted">
                Supabase Dashboard で対象プロジェクトを開きます。
              </p>
              <a
                href={SUPABASE_DASHBOARD_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-9 items-center rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent"
              >
                Supabase Dashboard
              </a>
            </li>
            <li className="rounded border border-card-border bg-background px-3 py-3">
              <span className="block text-xs font-bold text-accent">2. URL と key をコピーする</span>
              <p className="mt-1 text-xs text-muted">
                Connect ダイアログ、または Settings &gt; API Keys で Project URL と
                publishable key / legacy anon key を探します。
              </p>
              <a
                href={SUPABASE_API_KEYS_DOC_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-9 items-center rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent"
              >
                API keys の公式説明
              </a>
            </li>
            <li className="rounded border border-card-border bg-background px-3 py-3">
              <span className="block text-xs font-bold text-accent">3. `.env.local` に貼る</span>
              <p className="mt-1 text-xs text-muted">
                `NEXT_PUBLIC_SUPABASE_URL` には Project URL、
                `NEXT_PUBLIC_SUPABASE_ANON_KEY` には公開用 key を入れます。
                secret key / service_role key はブラウザへ公開される場所に入れないでください。
              </p>
            </li>
          </ol>
        </section>

        <section className="hud-border bg-card p-5">
          <h2 className="text-sm font-bold">
            {isConfigured ? '接続設定の状態' : '確認が必要な値'}
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {envIssues.length > 0 ? (
              envIssues.map((issue) => (
                <div
                  key={`${issue.key}-${issue.message}`}
                  className="rounded border border-card-border bg-background px-3 py-2"
                >
                  <code className="text-xs">{issue.key}</code>
                  <p className="mt-1 text-xs text-muted">{issue.message}</p>
                </div>
              ))
            ) : (
              <p className="rounded border border-card-border bg-background px-3 py-2 text-xs text-muted">
                必要な環境変数は揃っています。ログイン画面へ進めます。
              </p>
            )}
          </div>
        </section>

        <section className="hud-border bg-card p-5">
          <h2 className="text-sm font-bold">いま開ける画面</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-card-border bg-background px-3 py-3">
              <p className="text-xs font-bold text-accent">今すぐ利用可</p>
              <p className="mt-1 text-xs text-muted">
                デモ画面は Supabase の鍵なしで開けます。献立、買い物、栄養、固定枠の見た目を確認できます。
              </p>
              <Link
                href="/demo"
                className="mt-2 inline-flex min-h-9 items-center rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent"
              >
                デモを見る
              </Link>
            </div>
            <div className="rounded border border-card-border bg-background px-3 py-3">
              <p className="text-xs font-bold text-accent">
                {isConfigured ? '利用可' : '鍵の設定後に利用可'}
              </p>
              <p className="mt-1 text-xs text-muted">
                ログイン、新規登録、ダッシュボード、在庫、買い物リストは Supabase 接続後に実データで使います。
              </p>
              {isConfigured ? (
                <Link
                  href="/login"
                  className="mt-2 inline-flex min-h-9 items-center rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent"
                >
                  ログインへ進む
                </Link>
              ) : (
                <p className="mt-2 rounded border border-card-border bg-white px-3 py-2 text-xs text-muted">
                  `.env.local` を入れて開発サーバーを再起動すると開けます。
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="hud-border bg-card p-5">
          <h2 className="text-sm font-bold">`.env.local` の形</h2>
          <p className="mt-2 text-xs text-muted">
            `.env.example` を `.env.local` にコピーして、Supabase の値へ置き換えてください。
          </p>
          <pre className="mt-3 overflow-x-auto rounded border border-card-border bg-background p-3 text-xs">
            {`Copy-Item .env.example .env.local`}
          </pre>
          <pre className="mt-3 overflow-x-auto rounded border border-card-border bg-background p-3 text-xs">
            {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p className="mt-3 text-xs text-muted">
            値を入れたら開発サーバーを再起動してください。
          </p>
          <div className="mt-4 rounded border border-card-border bg-background px-3 py-3">
            <h3 className="text-xs font-bold text-accent">手元で診断する</h3>
            <p className="mt-1 text-xs text-muted">
              `.env.local` を作ったあと、ブラウザを開く前に次のコマンドで不足や仮値を確認できます。
            </p>
            <pre className="mt-3 overflow-x-auto rounded border border-card-border bg-white p-3 text-xs">
              {`npm run setup:doctor`}
            </pre>
            <p className="mt-3 text-xs text-muted">
              自動化や記録に使う場合は JSON 形式でも確認できます。
            </p>
            <pre className="mt-3 overflow-x-auto rounded border border-card-border bg-white p-3 text-xs">
              {`npm run --silent setup:doctor:json`}
            </pre>
            <p className="mt-3 text-xs text-muted">
              使える指定を確認したい場合は、help を開きます。
            </p>
            <pre className="mt-3 overflow-x-auto rounded border border-card-border bg-white p-3 text-xs">
              {`npm run setup:doctor:help`}
            </pre>
          </div>
        </section>

        <section className="hud-border bg-card p-5">
          <h2 className="text-sm font-bold">公開前に確認する案内</h2>
          <p className="mt-2 text-xs text-muted">
            利用規約、プライバシー、画像クレジットは、ログイン前でも確認できます。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-9 items-center rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
