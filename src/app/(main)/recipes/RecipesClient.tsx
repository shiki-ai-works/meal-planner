'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { RecipeAssignControls } from '@/components/recipe-assign'
import { cuisineBackground, cuisineBorderColor, fallbackEmoji } from '@/lib/cuisine'
import {
  buildInventoryIndex,
  getRecipeInventoryMatch,
  type RecipeInventoryMatch,
} from '@/lib/ingredient-match'
import {
  getPfcRatio,
  matchesNutritionMode,
  type NutritionFilterMode,
} from '@/lib/nutrition'
import type { CuisineGenre, DbRecipe, MealType } from '@/types/database'

const MEAL_FILTERS: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'breakfast', label: '朝' },
  { value: 'lunch', label: '昼' },
  { value: 'dinner', label: '夜' },
  { value: 'any', label: 'いつでも' },
]

const CUISINE_FILTERS: { value: CuisineGenre | 'all'; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: '和食', label: '和' },
  { value: '洋食', label: '洋' },
  { value: '中華', label: '中' },
  { value: 'エスニック', label: 'エスニック' },
  { value: 'その他', label: 'その他' },
]

const TIME_FILTERS = [
  { value: 0, label: '指定なし' },
  { value: 10, label: '10分以内' },
  { value: 20, label: '20分以内' },
  { value: 30, label: '30分以内' },
]

const CALORIE_FILTERS = [
  { value: 0, label: '指定なし' },
  { value: 400, label: '400 kcal以内' },
  { value: 600, label: '600 kcal以内' },
  { value: 800, label: '800 kcal以内' },
]

type SortMode = 'time' | 'inventory' | 'name'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'time', label: '早い順' },
  { value: 'inventory', label: '在庫順' },
  { value: 'name', label: '名前順' },
]

const NUTRITION_FILTERS: { value: NutritionFilterMode; label: string }[] = [
  { value: 'highProtein', label: 'P多め' },
  { value: 'lowFat', label: 'F控えめ' },
  { value: 'lowCarbs', label: 'C控えめ' },
]

interface Props {
  recipes: DbRecipe[]
  inventoryNames: string[]
}

interface AssignmentToast {
  recipeName: string
  message: string
}

const EMPTY_INVENTORY_MATCH: RecipeInventoryMatch = {
  matchedCount: 0,
  targetCount: 0,
  score: 0,
  matchedIngredients: [],
  missingIngredients: [],
  matchedInventoryNames: [],
}

function firstImageUrl(urls: string[] | null | undefined) {
  return urls?.find((url) => url.trim().length > 0)?.trim() ?? null
}

function mealLabel(mealType: MealType) {
  if (mealType === 'breakfast') return '朝'
  if (mealType === 'lunch') return '昼'
  if (mealType === 'dinner') return '夜'
  return 'いつでも'
}

function mealSlot(mealType: MealType) {
  return mealType === 'any' ? undefined : mealType
}

function searchableText(recipe: DbRecipe) {
  return [
    recipe.name,
    recipe.cuisine_genre ?? '',
    recipe.cooking_method ?? '',
    ...(recipe.tags ?? []),
    ...recipe.ingredients.map((ing) => ing.name),
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFKC')
}

function compareByTime(a: DbRecipe, b: DbRecipe) {
  const at = a.cooking_time_minutes ?? 999
  const bt = b.cooking_time_minutes ?? 999
  if (at !== bt) return at - bt
  return a.name.localeCompare(b.name, 'ja')
}

function compareByInventory(
  a: DbRecipe,
  b: DbRecipe,
  matchMap: Map<string, RecipeInventoryMatch>,
) {
  const am = matchMap.get(a.id) ?? EMPTY_INVENTORY_MATCH
  const bm = matchMap.get(b.id) ?? EMPTY_INVENTORY_MATCH
  if (am.score !== bm.score) return bm.score - am.score
  if (am.matchedCount !== bm.matchedCount) return bm.matchedCount - am.matchedCount
  if (am.targetCount !== bm.targetCount) return am.targetCount - bm.targetCount
  return compareByTime(a, b)
}

function inventoryBadgeClass(match: RecipeInventoryMatch) {
  if (match.score >= 80) return 'bg-success text-white'
  if (match.score >= 50) return 'bg-warning text-white'
  return 'bg-white/86 text-foreground'
}

function pfcLabel(recipe: DbRecipe) {
  const pfc = getPfcRatio(recipe.nutrition)
  return `${Math.round(pfc.protein)}/${Math.round(pfc.fat)}/${Math.round(
    pfc.carbs,
  )}`
}

export function RecipesClient({ recipes, inventoryNames }: Props) {
  const [query, setQuery] = useState('')
  const [mealType, setMealType] = useState<MealType | 'all'>('all')
  const [cuisine, setCuisine] = useState<CuisineGenre | 'all'>('all')
  const [maxMinutes, setMaxMinutes] = useState(0)
  const [maxCalories, setMaxCalories] = useState(0)
  const [nutritionFilters, setNutritionFilters] = useState<NutritionFilterMode[]>([])
  const [sortMode, setSortMode] = useState<SortMode>('time')
  const [inventoryOnly, setInventoryOnly] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<DbRecipe | null>(null)
  const [assignmentToast, setAssignmentToast] = useState<AssignmentToast | null>(null)

  const normalizedQuery = query.trim().toLowerCase().normalize('NFKC')
  const inventoryIndex = useMemo(
    () => buildInventoryIndex(inventoryNames),
    [inventoryNames],
  )
  const inventoryMatches = useMemo(() => {
    const entries: [string, RecipeInventoryMatch][] = recipes.map((recipe) => [
      recipe.id,
      getRecipeInventoryMatch(recipe, inventoryIndex),
    ])
    return new Map(entries)
  }, [recipes, inventoryIndex])

  const filtered = useMemo(() => {
    return recipes
      .filter((recipe) => {
        if (mealType !== 'all' && recipe.meal_type !== mealType) return false
        if (cuisine !== 'all' && recipe.cuisine_genre !== cuisine) return false
        if (
          maxMinutes > 0 &&
          (recipe.cooking_time_minutes == null ||
            recipe.cooking_time_minutes > maxMinutes)
        ) {
          return false
        }
        if (maxCalories > 0 && recipe.nutrition.calories > maxCalories) {
          return false
        }
        if (
          nutritionFilters.some(
            (filterMode) => !matchesNutritionMode(recipe.nutrition, filterMode),
          )
        ) {
          return false
        }
        if (normalizedQuery && !searchableText(recipe).includes(normalizedQuery)) {
          return false
        }
        const match = inventoryMatches.get(recipe.id) ?? EMPTY_INVENTORY_MATCH
        if (inventoryOnly && match.matchedCount === 0) return false
        return true
      })
      .sort((a, b) => {
        if (sortMode === 'inventory') {
          return compareByInventory(a, b, inventoryMatches)
        }
        if (sortMode === 'name') return a.name.localeCompare(b.name, 'ja')
        return compareByTime(a, b)
      })
  }, [
    recipes,
    mealType,
    cuisine,
    maxMinutes,
    maxCalories,
    nutritionFilters,
    normalizedQuery,
    inventoryMatches,
    inventoryOnly,
    sortMode,
  ])

  const imageCount = recipes.filter((recipe) => firstImageUrl(recipe.image_urls)).length
  const inventoryHitCount = filtered.filter(
    (recipe) =>
      (inventoryMatches.get(recipe.id) ?? EMPTY_INVENTORY_MATCH).matchedCount > 0,
  ).length
  const inventoryReadyCount = filtered.filter(
    (recipe) => (inventoryMatches.get(recipe.id) ?? EMPTY_INVENTORY_MATCH).score >= 80,
  ).length
  const hasNutritionFilters = maxCalories > 0 || nutritionFilters.length > 0

  function toggleNutritionFilter(filterMode: NutritionFilterMode) {
    setNutritionFilters((current) =>
      current.includes(filterMode)
        ? current.filter((item) => item !== filterMode)
        : [...current, filterMode],
    )
  }

  function clearFilters() {
    setQuery('')
    setMealType('all')
    setCuisine('all')
    setMaxMinutes(0)
    setMaxCalories(0)
    setNutritionFilters([])
    setInventoryOnly(false)
    setSortMode('time')
  }

  useEffect(() => {
    if (!assignmentToast) return
    const id = setTimeout(() => setAssignmentToast(null), 4500)
    return () => clearTimeout(id)
  }, [assignmentToast])

  return (
    <div className="flex flex-col gap-4">
      <section className="hud-border bg-card p-3 flex flex-col gap-3">
        <label className="text-xs text-muted" htmlFor="recipe-search">
          レシピ検索
        </label>
        <input
          id="recipe-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="料理名・食材・タグで探す"
          className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-[10px] text-muted">食事</div>
            <div className="flex flex-wrap gap-1">
              {MEAL_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMealType(item.value)}
                  className={`rounded border px-2 py-1 text-xs ${
                    mealType === item.value
                      ? 'border-accent bg-accent text-white'
                      : 'border-card-border bg-white text-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] text-muted">ジャンル</div>
            <div className="flex flex-wrap gap-1">
              {CUISINE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCuisine(item.value)}
                  className={`rounded border px-2 py-1 text-xs ${
                    cuisine === item.value
                      ? 'border-accent bg-accent text-white'
                      : 'border-card-border bg-white text-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-[10px] text-muted">
            調理時間
            <select
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(Number(e.target.value))}
              className="rounded border border-card-border bg-white px-2 py-2 text-sm text-foreground"
            >
              {TIME_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="flex flex-col gap-1 text-[10px] text-muted">
            kcal
            <select
              value={maxCalories}
              onChange={(e) => setMaxCalories(Number(e.target.value))}
              className="rounded border border-card-border bg-white px-2 py-2 text-sm text-foreground"
            >
              {CALORIE_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[10px] text-muted">
            並び順
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="rounded border border-card-border bg-white px-2 py-2 text-sm text-foreground"
            >
              {SORT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 self-end rounded border border-card-border bg-white px-3 py-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={inventoryOnly}
              onChange={(e) => setInventoryOnly(e.target.checked)}
              className="accent-accent"
            />
            在庫一致あり
          </label>
        </div>

        <div>
          <div className="mb-1 text-[10px] text-muted">PFC</div>
          <div className="flex flex-wrap gap-1">
            {NUTRITION_FILTERS.map((item) => {
              const active = nutritionFilters.includes(item.value)
              return (
                <label
                  key={item.value}
                  className={`flex h-8 items-center gap-1 rounded border px-2 text-xs ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-card-border bg-white text-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleNutritionFilter(item.value)}
                    className="sr-only"
                  />
                  {item.label}
                </label>
              )
            })}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          <span className="font-mono text-foreground">{filtered.length}</span> /{' '}
          {recipes.length} 件
        </span>
        <span>
          画像あり <span className="font-mono text-foreground">{imageCount}</span> 件
        </span>
        <span>
          在庫一致{' '}
          <span className="font-mono text-foreground">{inventoryHitCount}</span> 件
        </span>
        <span>
          作れそう{' '}
          <span className="font-mono text-foreground">{inventoryReadyCount}</span> 件
        </span>
        {hasNutritionFilters && (
          <span>
            栄養条件{' '}
            <span className="font-mono text-foreground">{filtered.length}</span>{' '}
            件
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="hud-border bg-card p-6 text-center">
          <p className="text-sm font-bold">条件に合うレシピがありません</p>
          <p className="mt-2 text-xs text-muted">
            食事や時間の条件を少しゆるめると、候補が戻ってきます。
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded border border-card-border bg-white px-4 py-2 text-xs font-bold text-muted hover:border-accent hover:text-accent"
          >
            条件をリセット
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((recipe) => {
            const imageUrl = firstImageUrl(recipe.image_urls)
            const inventoryMatch =
              inventoryMatches.get(recipe.id) ?? EMPTY_INVENTORY_MATCH
            const missingLabel = inventoryMatch.missingIngredients
              .slice(0, 2)
              .join('・')
            const style = {
              borderLeftColor: cuisineBorderColor(recipe.cuisine_genre),
              backgroundImage: imageUrl
                ? `linear-gradient(180deg, rgba(26,31,46,0.08), rgba(26,31,46,0.72)), url(${imageUrl})`
                : cuisineBackground(recipe.cuisine_genre),
            }

            return (
              <article
                key={recipe.id}
                className="hud-border relative min-h-44 overflow-hidden border-l-4 bg-card p-3 text-left shadow-[0_8px_18px_rgba(26,31,46,0.08)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={{
                  ...style,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                {!imageUrl && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center text-7xl opacity-60"
                  >
                    {fallbackEmoji(recipe.cuisine_genre, mealSlot(recipe.meal_type))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(recipe)}
                  className="absolute right-2 top-2 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-accent shadow-sm backdrop-blur-sm hover:bg-white"
                >
                  今週へ
                </button>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className={`text-base font-bold leading-tight ${
                      imageUrl ? 'text-white' : 'text-foreground'
                    }`}
                    style={
                      imageUrl
                        ? { textShadow: '0 2px 8px rgba(0,0,0,0.6)' }
                        : undefined
                    }
                  >
                    {recipe.name}
                  </Link>
                  <div
                    className={`mt-2 flex flex-wrap gap-1 text-[10px] ${
                      imageUrl ? 'text-white' : 'text-muted'
                    }`}
                  >
                    <span className="rounded bg-white/86 px-2 py-0.5 text-foreground">
                      {mealLabel(recipe.meal_type)}
                    </span>
                    {recipe.cuisine_genre && (
                      <span className="rounded bg-white/86 px-2 py-0.5 text-foreground">
                        {recipe.cuisine_genre}
                      </span>
                    )}
                    {recipe.cooking_time_minutes != null && (
                      <span className="rounded bg-white/86 px-2 py-0.5 font-mono text-foreground">
                        {recipe.cooking_time_minutes}分
                      </span>
                    )}
                    <span className="rounded bg-white/86 px-2 py-0.5 font-mono text-foreground">
                      {recipe.nutrition.calories} kcal
                    </span>
                    <span
                      className="rounded bg-white/86 px-2 py-0.5 font-mono text-foreground"
                      title="PFC kcal比"
                    >
                      PFC {pfcLabel(recipe)}
                    </span>
                    {inventoryMatch.matchedCount > 0 && (
                      <span
                        className={`rounded px-2 py-0.5 font-bold ${inventoryBadgeClass(
                          inventoryMatch,
                        )}`}
                        title={
                          inventoryMatch.matchedInventoryNames.length > 0
                            ? `一致: ${inventoryMatch.matchedInventoryNames.join('、')}`
                            : undefined
                        }
                      >
                        在庫 {inventoryMatch.matchedCount}/{inventoryMatch.targetCount}
                      </span>
                    )}
                    {inventoryMatch.matchedCount > 0 &&
                      inventoryMatch.targetCount > 0 && (
                        <span
                          className={`rounded px-2 py-0.5 font-mono font-bold ${inventoryBadgeClass(
                            inventoryMatch,
                          )}`}
                        >
                          作れそう {inventoryMatch.score}%
                        </span>
                      )}
                    {missingLabel && inventoryMatch.matchedCount > 0 && (
                      <span
                        className="rounded bg-white/86 px-2 py-0.5 text-foreground"
                        title={`不足: ${inventoryMatch.missingIngredients.join('、')}`}
                      >
                        あと {missingLabel}
                      </span>
                    )}
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="rounded bg-accent px-2 py-0.5 font-bold text-white"
                    >
                      詳細で献立へ
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selectedRecipe && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-foreground/35 px-3 pb-3 backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
        >
          <section className="hud-border w-full max-w-xl bg-card p-3 shadow-[0_16px_36px_rgba(26,31,46,0.22)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">献立に入れる</h2>
                <p className="mt-1 text-xs text-muted">{selectedRecipe.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="grid h-8 w-8 place-items-center rounded-full border border-card-border text-muted hover:text-foreground"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <RecipeAssignControls
              recipeId={selectedRecipe.id}
              recipeName={selectedRecipe.name}
              preferredMealType={selectedRecipe.meal_type}
              onAssigned={(message) => {
                setAssignmentToast({
                  recipeName: selectedRecipe.name,
                  message,
                })
                setTimeout(() => setSelectedRecipe(null), 500)
              }}
            />
          </section>
        </div>
      )}

      {assignmentToast && (
        <div
          className="fixed bottom-20 left-1/2 z-[80] w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-full bg-foreground px-3 py-2 text-background shadow-[0_12px_28px_rgba(26,31,46,0.28)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-xs">
              {assignmentToast.recipeName} を{assignmentToast.message}
            </span>
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white"
            >
              献立を見る
            </Link>
            <button
              type="button"
              onClick={() => setAssignmentToast(null)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-xs"
              aria-label="通知を閉じる"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
