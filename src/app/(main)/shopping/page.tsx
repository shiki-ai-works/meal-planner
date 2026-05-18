import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildShoppingList } from '@/lib/shopping-list'
import type {
  DbInventory,
  DbMealPlan,
  DbRecipe,
  DbUser,
  WeekPlan,
} from '@/types/database'
import { ShoppingClient } from './ShoppingClient'

function getMondayISO(d: Date): string {
  const dayIdx = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayIdx)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default async function ShoppingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStartDate = getMondayISO(new Date())

  const [userRes, recipesRes, planRes, invRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('recipes').select('*'),
    supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartDate)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('inventory').select('*').eq('user_id', user.id),
  ])

  const dbUser = (userRes.data ?? null) as DbUser | null
  const recipes = (recipesRes.data ?? []) as DbRecipe[]
  const plan = (planRes.data ?? null) as DbMealPlan | null
  const inventory = (invRes.data ?? []) as DbInventory[]

  const recipeMap = new Map<string, DbRecipe>()
  for (const r of recipes) recipeMap.set(r.id, r)

  const grouped = plan
    ? buildShoppingList({
        week: plan.plan as WeekPlan,
        recipeMap,
        servings: dbUser?.default_servings ?? 2,
        weekStartDate,
        inventory,
      })
    : null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">🛒 買い物リスト</h1>
      {grouped ? (
        <ShoppingClient weekStartDate={weekStartDate} grouped={grouped} />
      ) : (
        <p className="text-sm text-muted text-center py-6">
          今週の献立がありません。ダッシュボードで生成してください。
        </p>
      )}
    </div>
  )
}
