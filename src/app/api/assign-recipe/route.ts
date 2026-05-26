import { NextResponse } from 'next/server'
import { isUserOnboarded } from '@/lib/onboarding'
import { createClient } from '@/lib/supabase/server'
import { assignRecipeToWeek, emptyWeek, type MealSlot } from '@/lib/week-plan'
import type { DbMealPlan, DbRecipe, DbUser, WeekPlan } from '@/types/database'

type LockScope = 'none' | 'week' | 'weekly'

interface RequestBody {
  recipeId?: string
  weekStartDate?: string
  dayOfWeek?: number
  mealType?: MealSlot
  locked?: boolean
  lockScope?: LockScope
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const MEAL_TYPES: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const LOCK_SCOPES: LockScope[] = ['none', 'week', 'weekly']
const ASSIGN_RECIPE_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
}

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  if (!body.recipeId) {
    return NextResponse.json(
      { error: 'recipeId is required' },
      { status: 400, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }
  if (!body.weekStartDate || !ISO_DATE.test(body.weekStartDate)) {
    return NextResponse.json(
      { error: 'weekStartDate (YYYY-MM-DD) is required' },
      { status: 400, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }
  if (
    typeof body.dayOfWeek !== 'number' ||
    body.dayOfWeek < 0 ||
    body.dayOfWeek > 6
  ) {
    return NextResponse.json(
      { error: 'dayOfWeek must be between 0 and 6' },
      { status: 400, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }
  if (!body.mealType || !MEAL_TYPES.includes(body.mealType)) {
    return NextResponse.json(
      { error: 'mealType must be breakfast, lunch, or dinner' },
      { status: 400, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }
  if (body.lockScope && !LOCK_SCOPES.includes(body.lockScope)) {
    return NextResponse.json(
      { error: 'lockScope must be none, week, or weekly' },
      { status: 400, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  const lockScope: LockScope =
    body.lockScope ?? (body.locked === false ? 'none' : 'week')

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  const [profileRes, recipeRes] = await Promise.all([
    supabase
      .from('users')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('recipes').select('*').eq('id', body.recipeId).maybeSingle(),
  ])

  const profile = (profileRes.data ?? null) as Pick<
    DbUser,
    'onboarding_completed_at'
  > | null
  if (profileRes.error || !profile) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }
  if (!isUserOnboarded(profile)) {
    return NextResponse.json(
      { error: '初回設定を完了してからレシピを割り当ててください' },
      { status: 428, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  const recipe = recipeRes.data as DbRecipe | null
  if (recipeRes.error || !recipe) {
    return NextResponse.json(
      { error: 'Recipe not found' },
      { status: 404, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  const planRes = await supabase
    .from('meal_plans')
    .select('id, user_id, week_start_date, plan, is_active, created_at')
    .eq('user_id', user.id)
    .eq('week_start_date', body.weekStartDate)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (planRes.error) {
    return NextResponse.json(
      { error: `Failed to load plan: ${planRes.error.message}` },
      { status: 500, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  const currentPlan = (planRes.data ?? null) as DbMealPlan | null
  const nextWeek = assignRecipeToWeek({
    week: (currentPlan?.plan as WeekPlan | undefined) ?? emptyWeek(),
    dayOfWeek: body.dayOfWeek,
    mealType: body.mealType,
    recipeId: recipe.id,
    locked: lockScope !== 'none',
  })

  const saveRes = currentPlan
    ? await supabase
        .from('meal_plans')
        .update({ plan: nextWeek })
        .eq('id', currentPlan.id)
        .select('id, user_id, week_start_date, plan, is_active, created_at')
        .single()
    : await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          week_start_date: body.weekStartDate,
          plan: nextWeek,
          is_active: true,
        })
        .select('id, user_id, week_start_date, plan, is_active, created_at')
        .single()

  if (saveRes.error || !saveRes.data) {
    return NextResponse.json(
      { error: `Failed to save plan: ${saveRes.error?.message ?? 'unknown'}` },
      { status: 500, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
    )
  }

  if (lockScope === 'weekly') {
    const lockRes = await supabase.from('locked_meals').upsert(
      {
        user_id: user.id,
        day_of_week: body.dayOfWeek,
        meal_type: body.mealType,
        recipe_id: recipe.id,
        is_eating_out: false,
        note: null,
      },
      { onConflict: 'user_id,day_of_week,meal_type' },
    )

    if (lockRes.error) {
      return NextResponse.json(
        {
          error: `今週分は保存しましたが、毎週固定の保存に失敗しました: ${lockRes.error.message}`,
        },
        { status: 500, headers: ASSIGN_RECIPE_RESPONSE_HEADERS },
      )
    }
  }

  return NextResponse.json(
    {
      mealPlan: saveRes.data,
      recipeName: recipe.name,
      dayOfWeek: body.dayOfWeek,
      mealType: body.mealType,
      lockScope,
    },
    {
      status: currentPlan ? 200 : 201,
      headers: ASSIGN_RECIPE_RESPONSE_HEADERS,
    },
  )
}
