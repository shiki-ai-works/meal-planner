import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildShoppingList } from '@/lib/shopping-list'
import { getMondayISO } from '@/lib/week-plan'
import type {
  DbInventory,
  DbMealPlan,
  DbPantryTemplate,
  DbRecipe,
  DbUser,
  WeekPlan,
} from '@/types/database'
import { ShoppingClient } from './ShoppingClient'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStartDate = getMondayISO(new Date())

  const [userRes, recipesRes, planRes, invRes, pantryRes] = await Promise.all([
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
    supabase
      .from('pantry_templates')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const dbUser = (userRes.data ?? null) as DbUser | null
  const recipes = (recipesRes.data ?? []) as DbRecipe[]
  const plan = (planRes.data ?? null) as DbMealPlan | null
  const inventory = (invRes.data ?? []) as DbInventory[]
  const pantry = (pantryRes.data ?? null) as DbPantryTemplate | null
  const pantryItems = pantry?.items ?? []

  const recipeMap = new Map<string, DbRecipe>()
  for (const r of recipes) recipeMap.set(r.id, r)

  const grouped = plan
    ? buildShoppingList({
        week: plan.plan as WeekPlan,
        recipeMap,
        servings: dbUser?.default_servings ?? 2,
        weekStartDate,
        inventory,
        pantryItems,
      })
    : null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-xl font-bold">🛒 買い物リスト</h1>
        <Link
          href="/pantry"
          className="text-[10px] text-muted hover:text-accent"
        >
          🥢 常備品 ({pantryItems.length})
        </Link>
      </div>
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
