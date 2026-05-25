import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMondayISO } from '@/lib/week-plan'
import type { DbMealPlan, DbRecipe, DbUser } from '@/types/database'
import { WeekCalendar } from './WeekCalendar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStartDate = getMondayISO(new Date())

  const [userRes, recipesRes, planRes] = await Promise.all([
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
  ])

  const dbUser = (userRes.data ?? null) as DbUser | null
  const recipes = (recipesRes.data ?? []) as DbRecipe[]
  const plan = (planRes.data ?? null) as DbMealPlan | null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="app-title-shadow text-2xl font-bold leading-tight text-accent"
            data-title="完全栄養ランダム献立達人"
          >
            完全栄養ランダム献立達人
          </h1>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
        <div className="text-xs text-muted text-right">
          <div>週開始</div>
          <div className="font-mono">{weekStartDate}</div>
        </div>
      </div>

      <WeekCalendar
        weekStartDate={weekStartDate}
        initialPlan={plan}
        recipes={recipes}
        initialPersonaId={dbUser?.selected_persona ?? 'mei'}
        targetCalories={dbUser?.target_calories ?? 2000}
        targetPfc={{
          protein: dbUser?.target_pfc_protein ?? 20,
          fat: dbUser?.target_pfc_fat ?? 25,
          carbs: dbUser?.target_pfc_carbs ?? 55,
        }}
      />
    </div>
  )
}
