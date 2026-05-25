import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { CSSProperties } from 'react'
import { cuisineBackground, cuisineBorderColor, fallbackEmoji } from '@/lib/cuisine'
import { createClient } from '@/lib/supabase/server'
import { getMondayISO } from '@/lib/week-plan'
import type { DbMealPlan, DbRecipe, DbUser } from '@/types/database'
import { RecipeAssignPanel } from './RecipeAssignPanel'
import { RecipeDetailClient } from './RecipeDetailClient'

interface Params {
  id: string
}

const HERO_OVERLAY =
  'linear-gradient(180deg, rgba(26,31,46,0.12) 0%, rgba(26,31,46,0.16) 42%, rgba(26,31,46,0.78) 100%)'

function firstImageUrl(urls: string[] | null | undefined) {
  return urls?.find((url) => url.trim().length > 0)?.trim() ?? null
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

  const weekStartDate = getMondayISO(new Date())
  const [recipeRes, userRes, recipesRes, planRes] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('users')
      .select('default_servings')
      .eq('id', user.id)
      .single(),
    supabase.from('recipes').select('*'),
    supabase
      .from('meal_plans')
      .select('id, user_id, week_start_date, plan, is_active, created_at')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartDate)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const recipe = recipeRes.data as DbRecipe | null
  if (!recipe) notFound()

  const defaultServings =
    (userRes.data as Pick<DbUser, 'default_servings'> | null)?.default_servings ??
    recipe.base_servings ??
    1
  const recipes = ((recipesRes.data ?? []) as DbRecipe[]).sort((a, b) =>
    a.name.localeCompare(b.name, 'ja'),
  )
  const currentPlan = (planRes.data ?? null) as DbMealPlan | null
  const photoUrl = firstImageUrl(recipe.image_urls)
  const accentColor = cuisineBorderColor(recipe.cuisine_genre)
  const heroStyle: CSSProperties = {
    borderLeftColor: accentColor,
    backgroundImage: photoUrl
      ? `${HERO_OVERLAY}, url(${photoUrl})`
      : `${HERO_OVERLAY}, ${cuisineBackground(recipe.cuisine_genre)}`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">
      <Link
        href="/dashboard"
        className="text-xs text-muted hover:text-accent w-fit"
      >
        ← ダッシュボードに戻る
      </Link>

      <header
        className="hud-border relative min-h-[260px] overflow-hidden border-l-4 bg-card shadow-[0_16px_32px_rgba(26,31,46,0.12)]"
        style={heroStyle}
      >
        {!photoUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-8xl opacity-80 drop-shadow-[0_8px_18px_rgba(26,31,46,0.35)]"
          >
            {fallbackEmoji(recipe.cuisine_genre)}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h1
            className="text-2xl font-bold leading-tight"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.55)' }}
          >
            {recipe.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {recipe.cuisine_genre && (
              <span className="bg-white/88 text-foreground rounded px-2 py-1 backdrop-blur-sm">
                {recipe.cuisine_genre}
              </span>
            )}
            {recipe.cooking_method && (
              <span className="bg-white/88 text-foreground rounded px-2 py-1 backdrop-blur-sm">
                {recipe.cooking_method}
              </span>
            )}
            {recipe.cooking_time_minutes != null && (
              <span className="bg-white/88 text-foreground rounded px-2 py-1 font-mono backdrop-blur-sm">
                {recipe.cooking_time_minutes}分
              </span>
            )}
            {recipe.difficulty_level != null && (
              <span className="bg-white/88 text-foreground rounded px-2 py-1 backdrop-blur-sm">
                {'★'.repeat(recipe.difficulty_level)}
              </span>
            )}
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-white/88">
              {recipe.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      <RecipeAssignPanel
        recipeId={recipe.id}
        recipeName={recipe.name}
        preferredMealType={recipe.meal_type}
        weekStartDate={weekStartDate}
        initialPlan={currentPlan}
        recipes={recipes}
      />

      <RecipeDetailClient
        recipe={recipe}
        defaultServings={defaultServings}
      />
    </div>
  )
}
