import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbPantryTemplate, DbUser } from '@/types/database'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [userRes, pantryRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('pantry_templates')
      .select('items')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const dbUser = (userRes.data ?? null) as DbUser | null
  const pantry = (pantryRes.data ?? null) as Pick<
    DbPantryTemplate,
    'items'
  > | null
  const pantryCount = pantry?.items?.length ?? 0

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">⚙️ 設定</h1>
      <p className="text-xs text-muted mb-4">{user.email}</p>
      <SettingsClient initialUser={dbUser} />

      <div className="mt-6">
        <Link
          href="/pantry"
          className="hud-border bg-card p-3 flex items-center justify-between hover:border-accent"
        >
          <div className="flex flex-col">
            <span className="text-sm font-bold">🥢 常備品テンプレート</span>
            <span className="text-[10px] text-muted">
              買い物リストから自動除外する食材を管理
            </span>
          </div>
          <span className="text-xs text-muted">
            <span className="font-mono text-foreground">{pantryCount}</span> 件 →
          </span>
        </Link>
      </div>
    </div>
  )
}
