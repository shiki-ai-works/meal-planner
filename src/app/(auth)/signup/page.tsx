'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    if (!acceptedTerms) {
      setError('利用規約とプライバシーポリシーを確認してください')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('このメールアドレスはすでに登録されています')
      } else {
        setError('登録に失敗しました。もう一度お試しください')
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="hud-border bg-[var(--card)] p-8">
      <h2 className="text-lg font-semibold mb-6 text-[var(--foreground)]">新規登録</h2>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1">
            表示名
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            className="w-full px-3 py-2 rounded-md border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            placeholder="ニックネーム"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 rounded-md border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-1">
            パスワード <span className="text-xs text-[var(--muted)]">（8文字以上）</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded-md border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--danger)] bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <div className="rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-2">
          <label className="flex cursor-pointer items-start gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
            />
            <span>
              <Link href="/legal/terms" className="font-bold text-[var(--accent)] hover:underline">
                利用規約
              </Link>
              と
              <Link href="/legal/privacy" className="font-bold text-[var(--accent)] hover:underline">
                プライバシーポリシー
              </Link>
              を確認しました。
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !acceptedTerms}
          className="w-full py-2.5 px-4 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '登録中...' : 'アカウントを作成'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
          ログイン
        </Link>
      </p>
    </div>
  )
}
