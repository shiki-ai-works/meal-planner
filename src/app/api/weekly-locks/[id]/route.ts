import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MealSlot } from '@/lib/week-plan'
import type { DbLockedMeal, DbRecipe } from '@/types/database'

interface PatchBody {
  recipeId?: string | null
  isEatingOut?: boolean
  dayOfWeek?: number
  mealType?: MealSlot
}

const MEAL_TYPES: MealSlot[] = ['breakfast', 'lunch', 'dinner']

async function getAuthedClient() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return { supabase, user: null }
  return { supabase, user }
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
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    body.dayOfWeek !== undefined &&
    (typeof body.dayOfWeek !== 'number' ||
      body.dayOfWeek < 0 ||
      body.dayOfWeek > 6)
  ) {
    return NextResponse.json(
      { error: 'dayOfWeek must be between 0 and 6' },
      { status: 400 },
    )
  }
  if (body.mealType !== undefined && !MEAL_TYPES.includes(body.mealType)) {
    return NextResponse.json(
      { error: 'mealType must be breakfast, lunch, or dinner' },
      { status: 400 },
    )
  }

  const { supabase, user } = await getAuthedClient()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      { status: 500 },
    )
  }
  if (!currentLock) {
    return NextResponse.json({ error: 'Weekly lock not found' }, { status: 404 })
  }

  const isEatingOut =
    typeof body.isEatingOut === 'boolean'
      ? body.isEatingOut
      : currentLock.is_eating_out
  const recipeId = isEatingOut ? null : (body.recipeId ?? currentLock.recipe_id)
  if (!isEatingOut && !recipeId) {
    return NextResponse.json(
      { error: 'recipeId is required unless isEatingOut is true' },
      { status: 400 },
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
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
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
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: `Failed to update weekly lock: ${updateRes.error.message}` },
      { status: 500 },
    )
  }
  if (!lock) {
    return NextResponse.json({ error: 'Weekly lock not found' }, { status: 404 })
  }

  return NextResponse.json({ lock })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { supabase, user } = await getAuthedClient()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      { status: 500 },
    )
  }
  if (!deleteRes.data) {
    return NextResponse.json({ error: 'Weekly lock not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
