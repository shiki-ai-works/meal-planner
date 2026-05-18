import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbUser } from '@/types/database'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const dbUser = data as DbUser | null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">⚙️ 設定</h1>
      <p className="text-xs text-muted mb-4">{user.email}</p>
      <SettingsClient initialUser={dbUser} />
    </div>
  )
}
