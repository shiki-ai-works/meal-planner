import { NextResponse } from 'next/server'
import { isUserOnboarded } from '@/lib/onboarding'
import { createClient } from '@/lib/supabase/server'
import type { MealSlot } from '@/lib/week-plan'
import type { DbLockedMeal, DbRecipe, DbUser } from '@/types/database'

interface PatchBody {
  recipeId?: string | null
  isEatingOut?: boolean
  dayOfWeek?: number
  mealType?: MealSlot
}

const MEAL_TYPES: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const WEEKLY_LOCKS_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
}

async function getAuthedClient() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return { supabase, user: null }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle()
  const dbUser = (profile ?? null) as Pick<
    DbUser,
    'onboarding_completed_at'
  > | null

  if (profileError || !dbUser) {
    return { supabase, user, onboardingError: 'missing-profile' as const }
  }
  if (!isUserOnboarded(dbUser)) {
    return { supabase, user, onboardingError: 'incomplete' as const }
  }

  return { supabase, user, onboardingError: null }
}

function onboardingErrorResponse(error: 'missing-profile' | 'incomplete') {
  if (error === 'missing-profile') {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  return NextResponse.json(
    { error: '初回設定を完了してから毎週固定を編集してください' },
    { status: 428, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let body: PatchBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  if (
    body.dayOfWeek !== undefined &&
    (typeof body.dayOfWeek !== 'number' ||
      body.dayOfWeek < 0 ||
      body.dayOfWeek > 6)
  ) {
    return NextResponse.json(
      { error: 'dayOfWeek must be between 0 and 6' },
      { status: 400, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }
  if (body.mealType !== undefined && !MEAL_TYPES.includes(body.mealType)) {
    return NextResponse.json(
      { error: 'mealType must be breakfast, lunch, or dinner' },
      { status: 400, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  const { supabase, user, onboardingError } = await getAuthedClient()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }
  if (onboardingError) {
    return onboardingErrorResponse(onboardingError)
  }

  const currentRes = await supabase
    .from('locked_meals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const currentLock = currentRes.data as DbLockedMeal | null
  if (currentRes.error) {
    return NextResponse.json(
      { error: `Failed to load weekly lock: ${currentRes.error.message}` },
      { status: 500, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }
  if (!currentLock) {
    return NextResponse.json(
      { error: 'Weekly lock not found' },
      { status: 404, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  const isEatingOut =
    typeof body.isEatingOut === 'boolean'
      ? body.isEatingOut
      : currentLock.is_eating_out
  const recipeId = isEatingOut ? null : (body.recipeId ?? currentLock.recipe_id)
  if (!isEatingOut && !recipeId) {
    return NextResponse.json(
      { error: 'recipeId is required unless isEatingOut is true' },
      { status: 400, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  if (!isEatingOut) {
    const recipeRes = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle()

    const recipe = recipeRes.data as Pick<DbRecipe, 'id'> | null
    if (recipeRes.error || !recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
      )
    }
  }

  const updateRes = await supabase
    .from('locked_meals')
    .update({
      day_of_week: body.dayOfWeek ?? currentLock.day_of_week,
      meal_type: body.mealType ?? currentLock.meal_type,
      recipe_id: recipeId,
      is_eating_out: isEatingOut,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle()

  const lock = updateRes.data as DbLockedMeal | null
  if (updateRes.error) {
    if (updateRes.error.code === '23505') {
      return NextResponse.json(
        { error: 'その曜日と食事枠には、すでに毎週固定があります' },
        { status: 409, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
      )
    }
    return NextResponse.json(
      { error: `Failed to update weekly lock: ${updateRes.error.message}` },
      { status: 500, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }
  if (!lock) {
    return NextResponse.json(
      { error: 'Weekly lock not found' },
      { status: 404, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  return NextResponse.json(
    { lock },
    { headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
  )
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { supabase, user, onboardingError } = await getAuthedClient()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }
  if (onboardingError) {
    return onboardingErrorResponse(onboardingError)
  }

  const deleteRes = await supabase
    .from('locked_meals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (deleteRes.error) {
    return NextResponse.json(
      { error: `Failed to delete weekly lock: ${deleteRes.error.message}` },
      { status: 500, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }
  if (!deleteRes.data) {
    return NextResponse.json(
      { error: 'Weekly lock not found' },
      { status: 404, headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
    )
  }

  return NextResponse.json(
    { ok: true },
    { headers: WEEKLY_LOCKS_RESPONSE_HEADERS },
  )
}
