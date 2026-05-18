import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbInventory } from '@/types/database'
import { InventoryClient } from './InventoryClient'

export default async function InventoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', user.id)
    .order('expiry_date', { ascending: true, nullsFirst: false })
    .order('added_at', { ascending: false })

  const items = (data ?? []) as DbInventory[]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">🗄️ 在庫管理</h1>
      <InventoryClient initialItems={items} />
    </div>
  )
}
