import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">超献立プランナー</h1>
          <p className="text-sm text-[var(--muted)]">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Phase 2で実装 */}
      <div className="hud-border bg-[var(--card)] p-8 text-center">
        <p className="text-4xl mb-4">🍱</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Phase 1 完了！
        </h2>
        <p className="text-sm text-[var(--muted)]">
          認証・DBスキーマ・レシピデータの準備ができました。
          <br />
          Phase 2で献立生成エンジンとダッシュボードを実装します。
        </p>
      </div>
    </div>
  )
}
