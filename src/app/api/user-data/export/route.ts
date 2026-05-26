import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { USER_DATA_RESPONSE_HEADERS } from '@/lib/user-data'

export const dynamic = 'force-dynamic'

function jsonAttachmentName(date: Date) {
  return `meal-planner-user-data-${date.toISOString().slice(0, 10)}.json`
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: USER_DATA_RESPONSE_HEADERS },
    )
  }

  const [
    profileRes,
    mealPlansRes,
    lockedMealsRes,
    inventoryRes,
    pantryRes,
    conditionFlagsRes,
    shoppingListsRes,
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start_date', { ascending: true }),
    supabase
      .from('locked_meals')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true }),
    supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false }),
    supabase.from('pantry_templates').select('*').eq('user_id', user.id),
    supabase
      .from('condition_flags')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true }),
    supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const failed = [
    ['profile', profileRes.error],
    ['mealPlans', mealPlansRes.error],
    ['lockedMeals', lockedMealsRes.error],
    ['inventory', inventoryRes.error],
    ['pantryTemplates', pantryRes.error],
    ['conditionFlags', conditionFlagsRes.error],
    ['shoppingLists', shoppingListsRes.error],
  ].find(([, error]) => error)

  if (failed) {
    const [name, error] = failed
    return NextResponse.json(
      {
        error: `Failed to export ${name}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      },
      { status: 500, headers: USER_DATA_RESPONSE_HEADERS },
    )
  }

  const exportedAt = new Date()
  const body = {
    schemaVersion: 1,
    exportedAt: exportedAt.toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
    },
    data: {
      profile: profileRes.data ?? null,
      mealPlans: mealPlansRes.data ?? [],
      lockedMeals: lockedMealsRes.data ?? [],
      inventory: inventoryRes.data ?? [],
      pantryTemplates: pantryRes.data ?? [],
      conditionFlags: conditionFlagsRes.data ?? [],
      shoppingLists: shoppingListsRes.data ?? [],
    },
  }

  return NextResponse.json(body, {
    headers: {
      ...USER_DATA_RESPONSE_HEADERS,
      'Content-Disposition': `attachment; filename="${jsonAttachmentName(exportedAt)}"`,
    },
  })
}
