import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  USER_DATA_RESPONSE_HEADERS,
  hasUserDataDeleteConfirmation,
} from '@/lib/user-data'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request) {
  if (!hasUserDataDeleteConfirmation(request.headers)) {
    return NextResponse.json(
      { error: '削除確認ヘッダーが必要です' },
      {
        status: 400,
        headers: USER_DATA_RESPONSE_HEADERS,
      },
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
      { status: 401, headers: USER_DATA_RESPONSE_HEADERS },
    )
  }

  const deletions = [
    ['shopping_lists', () => supabase.from('shopping_lists').delete().eq('user_id', user.id)],
    ['condition_flags', () => supabase.from('condition_flags').delete().eq('user_id', user.id)],
    ['pantry_templates', () => supabase.from('pantry_templates').delete().eq('user_id', user.id)],
    ['inventory', () => supabase.from('inventory').delete().eq('user_id', user.id)],
    ['locked_meals', () => supabase.from('locked_meals').delete().eq('user_id', user.id)],
    ['meal_plans', () => supabase.from('meal_plans').delete().eq('user_id', user.id)],
    ['users', () => supabase.from('users').delete().eq('id', user.id)],
  ] as const

  for (const [tableName, runDelete] of deletions) {
    const { error } = await runDelete()
    if (error) {
      return NextResponse.json(
        { error: `Failed to delete ${tableName}: ${error.message}` },
        { status: 500, headers: USER_DATA_RESPONSE_HEADERS },
      )
    }
  }

  return NextResponse.json(
    {
      ok: true,
      deletedAt: new Date().toISOString(),
      message: 'User application data deleted',
    },
    {
      headers: USER_DATA_RESPONSE_HEADERS,
    },
  )
}
