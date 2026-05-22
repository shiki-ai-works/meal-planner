import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbMealPlan, DbRecipe, DbUser } from '@/types/database'
import { WeekCalendar } from './WeekCalendar'

function getMondayISO(d: Date): string {
  const dayIdx = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayIdx)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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
          <h1 className="text-xl font-bold">超献立プランナー</h1>
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
      />
    </div>
  )
}
