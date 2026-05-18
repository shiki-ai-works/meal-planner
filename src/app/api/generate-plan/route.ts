import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeekPlan } from '@/lib/meal-generator'
import type {
  DbLockedMeal,
  DbRecipe,
  DbUser,
  PersonaId,
} from '@/types/database'

interface RequestBody {
  personaId?: PersonaId
  weekStartDate: string
  seed?: number
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.weekStartDate || !ISO_DATE.test(body.weekStartDate)) {
    return NextResponse.json(
      { error: 'weekStartDate (YYYY-MM-DD) is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [userRes, recipesRes, locksRes] = await Promise.all([
    supabase
      .from('users')
      .select('id, display_name, default_servings, disliked_ingredients, allergic_ingredients, selected_persona, created_at')
      .eq('id', user.id)
      .single(),
    supabase.from('recipes').select('*'),
    supabase.from('locked_meals').select('*').eq('user_id', user.id),
  ])

  if (userRes.error || !userRes.data) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404 }
    )
  }
  if (recipesRes.error) {
    return NextResponse.json(
      { error: `Failed to load recipes: ${recipesRes.error.message}` },
      { status: 500 }
    )
  }
  if (locksRes.error) {
    return NextResponse.json(
      { error: `Failed to load locked meals: ${locksRes.error.message}` },
      { status: 500 }
    )
  }

  const dbUser = userRes.data as DbUser
  const recipes = (recipesRes.data ?? []) as DbRecipe[]
  const locks = (locksRes.data ?? []) as DbLockedMeal[]

  const personaId: PersonaId = body.personaId ?? dbUser.selected_persona

  const { weekPlan } = generateWeekPlan({
    recipes,
    personaId,
    dislikedIngredients: dbUser.disliked_ingredients ?? [],
    allergicIngredients: dbUser.allergic_ingredients ?? [],
    lockedMeals: locks,
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
      { status: 500 }
    )
  }

  return NextResponse.json({ mealPlan: upsert.data, personaId }, { status: 201 })
}
