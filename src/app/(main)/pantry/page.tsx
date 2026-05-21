import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { DbPantryTemplate } from '@/types/database'
import { PantryClient } from './PantryClient'

export default async function PantryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('pantry_templates')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const initial = (data ?? null) as DbPantryTemplate | null

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
      <Link href="/settings" className="text-xs text-muted hover:text-accent">
        ← 設定に戻る
      </Link>
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">🥢 常備品テンプレート</h1>
      </header>
      <p className="text-xs text-muted">
        ここに登録した食材は買い物リストから自動で除外されます。米・塩・醤油など毎週同じものを買わない用途に。
      </p>
      <PantryClient initial={initial} />
    </div>
  )
}
