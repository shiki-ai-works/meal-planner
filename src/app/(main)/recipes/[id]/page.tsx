import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbRecipe, DbUser } from '@/types/database'
import { RecipeDetailClient } from './RecipeDetailClient'

interface Params {
  id: string
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [recipeRes, userRes] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('users')
      .select('default_servings')
      .eq('id', user.id)
      .single(),
  ])

  const recipe = recipeRes.data as DbRecipe | null
  if (!recipe) notFound()

  const defaultServings =
    (userRes.data as Pick<DbUser, 'default_servings'> | null)?.default_servings ??
    recipe.base_servings ??
    1

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
      <Link
        href="/dashboard"
        className="text-xs text-muted hover:text-accent"
      >
        ← ダッシュボードに戻る
      </Link>

      <header className="hud-border bg-card p-4 flex flex-col gap-2">
        <h1 className="text-xl font-bold">{recipe.name}</h1>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          {recipe.cuisine_genre && (
            <span className="border border-card-border rounded px-2 py-0.5">
              {recipe.cuisine_genre}
            </span>
          )}
          {recipe.cooking_method && (
            <span className="border border-card-border rounded px-2 py-0.5">
              {recipe.cooking_method}
            </span>
          )}
          {recipe.cooking_time_minutes != null && (
            <span className="border border-card-border rounded px-2 py-0.5">
              ⏱ {recipe.cooking_time_minutes}分
            </span>
          )}
          {recipe.difficulty_level != null && (
            <span className="border border-card-border rounded px-2 py-0.5">
              {'★'.repeat(recipe.difficulty_level)}
            </span>
          )}
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[10px] text-muted">
            {recipe.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}
      </header>

      <RecipeDetailClient
        recipe={recipe}
        defaultServings={defaultServings}
      />
    </div>
  )
}
