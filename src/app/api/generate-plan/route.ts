import { NextResponse } from 'next/server'
import { isUserOnboarded } from '@/lib/onboarding'
import { isPersonaId } from '@/lib/personas'
import { createClient } from '@/lib/supabase/server'
import { generateWeekPlan } from '@/lib/meal-generator'
import type {
  DbLockedMeal,
  DbRecipe,
  DbUser,
  PersonaId,
} from '@/types/database'

interface RequestBody {
  personaId?: unknown
  weekStartDate: string
  seed?: number
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const GENERATE_PLAN_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
}

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }

  if (!body.weekStartDate || !ISO_DATE.test(body.weekStartDate)) {
    return NextResponse.json(
      { error: 'weekStartDate (YYYY-MM-DD) is required' },
      { status: 400, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }
  if (body.personaId !== undefined && !isPersonaId(body.personaId)) {
    return NextResponse.json(
      { error: 'personaId must be one of mei, arisa, tsuzuri, iris, cleio, or milra' },
      { status: 400, headers: GENERATE_PLAN_RESPONSE_HEADERS },
    )
  }

  const [userRes, recipesRes, locksRes, inventoryRes] = await Promise.all([
    supabase
      .from('users')
      .select('id, display_name, default_servings, disliked_ingredients, allergic_ingredients, selected_persona, self_cook_frequency, planning_goal, onboarding_completed_at, created_at')
      .eq('id', user.id)
      .single(),
    supabase.from('recipes').select('*'),
    supabase.from('locked_meals').select('*').eq('user_id', user.id),
    supabase.from('inventory').select('ingredient_name').eq('user_id', user.id),
  ])

  if (userRes.error || !userRes.data) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }
  if (!isUserOnboarded(userRes.data as DbUser)) {
    return NextResponse.json(
      { error: '初回設定を完了してから献立を生成してください' },
      { status: 428, headers: GENERATE_PLAN_RESPONSE_HEADERS },
    )
  }
  if (recipesRes.error) {
    return NextResponse.json(
      { error: `Failed to load recipes: ${recipesRes.error.message}` },
      { status: 500, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }
  if (locksRes.error) {
    return NextResponse.json(
      { error: `Failed to load locked meals: ${locksRes.error.message}` },
      { status: 500, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }
  if (inventoryRes.error) {
    return NextResponse.json(
      { error: `Failed to load inventory: ${inventoryRes.error.message}` },
      { status: 500, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }

  const dbUser = userRes.data as DbUser
  const recipes = (recipesRes.data ?? []) as DbRecipe[]
  const locks = (locksRes.data ?? []) as DbLockedMeal[]
  const inventoryNames = (inventoryRes.data ?? [])
    .map((item) => item.ingredient_name)
    .filter((name): name is string => typeof name === 'string')

  const personaId: PersonaId = body.personaId ?? dbUser.selected_persona

  const { weekPlan } = generateWeekPlan({
    recipes,
    personaId,
    dislikedIngredients: dbUser.disliked_ingredients ?? [],
    allergicIngredients: dbUser.allergic_ingredients ?? [],
    lockedMeals: locks,
    inventoryNames,
    planningGoal: dbUser.planning_goal,
    selfCookFrequency: dbUser.self_cook_frequency,
    seed: body.seed,
  })

  const upsert = await supabase
    .from('meal_plans')
    .upsert(
      {
        user_id: user.id,
        week_start_date: body.weekStartDate,
        plan: weekPlan,
        is_active: true,
      },
      { onConflict: 'user_id,week_start_date' }
    )
    .select('id, user_id, week_start_date, plan, is_active, created_at')
    .single()

  if (upsert.error || !upsert.data) {
    return NextResponse.json(
      { error: `Failed to save plan: ${upsert.error?.message ?? 'unknown'}` },
      { status: 500, headers: GENERATE_PLAN_RESPONSE_HEADERS }
    )
  }

  return NextResponse.json(
    { mealPlan: upsert.data, personaId },
    { status: 201, headers: GENERATE_PLAN_RESPONSE_HEADERS }
  )
}
