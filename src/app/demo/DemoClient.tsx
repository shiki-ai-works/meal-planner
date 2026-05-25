'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { MealCard, type MealSlot } from '@/components/meal-card'
import { NutritionChart } from '@/components/nutrition-chart'
import {
  DEMO_INVENTORY,
  DEMO_LOCKED_MEALS,
  DEMO_NOW,
  DEMO_PANTRY_ITEMS,
  DEMO_RECIPES,
  DEMO_TARGET_CALORIES,
  DEMO_TARGET_PFC,
  DEMO_WEEK_START_DATE,
} from '@/lib/demo-data'
import { generateWeekPlan } from '@/lib/meal-generator'
import { calculateWeekNutrition } from '@/lib/nutrition'
import { PERSONA_LIST, getPersona } from '@/lib/personas'
import {
  CATEGORY_ORDER,
  buildShoppingList,
  type ShoppingItem,
} from '@/lib/shopping-list'
import {
  DAY_LABELS,
  MEAL_SLOT_LABEL,
  emptyDay,
  type MealSlot as WeekMealSlot,
} from '@/lib/week-plan'
import type {
  DayMeals,
  DbLockedMeal,
  DbRecipe,
  PersonaId,
  WeekPlan,
} from '@/types/database'

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const INITIAL_SEED = 20260524
const EATING_OUT_VALUE = '__eating_out__'

const DEMO_SECTIONS = [
  { id: 'week', label: '献立', subLabel: '7日分' },
  { id: 'locks', label: '固定', subLabel: '毎週' },
  { id: 'shopping', label: '買い物', subLabel: '一覧' },
  { id: 'nutrition', label: '栄養', subLabel: 'PFC' },
] as const

type DemoSectionId = (typeof DEMO_SECTIONS)[number]['id']

type EatingOutKey =
  | 'is_eating_out_breakfast'
  | 'is_eating_out_lunch'
  | 'is_eating_out_dinner'

const EATING_OUT_KEY: Record<MealSlot, EatingOutKey> = {
  breakfast: 'is_eating_out_breakfast',
  lunch: 'is_eating_out_lunch',
  dinner: 'is_eating_out_dinner',
}

function buildDemoWeek(
  personaId: PersonaId,
  seed: number,
  lockedMeals: DbLockedMeal[],
) {
  return generateWeekPlan({
    recipes: DEMO_RECIPES,
    personaId,
    dislikedIngredients: [],
    allergicIngredients: [],
    lockedMeals,
    seed,
  }).weekPlan
}

function getSlotFields(day: DayMeals, slot: MealSlot) {
  if (slot === 'breakfast') {
    return {
      recipeId: day.breakfast,
      locked: day.breakfast_locked,
      eatingOut: day.is_eating_out_breakfast,
    }
  }
  if (slot === 'lunch') {
    return {
      recipeId: day.lunch,
      locked: day.lunch_locked,
      eatingOut: day.is_eating_out_lunch,
    }
  }
  return {
    recipeId: day.dinner,
    locked: day.dinner_locked,
    eatingOut: day.is_eating_out_dinner,
  }
}

function countMeals(week: WeekPlan) {
  let locked = 0
  let eatingOut = 0
  const recipeIds = new Set<string>()

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const day = week[dayIdx] ?? emptyDay()
    for (const slot of SLOTS) {
      const fields = getSlotFields(day, slot)
      if (fields.locked) locked++
      if (fields.eatingOut) {
        eatingOut++
        continue
      }
      if (fields.recipeId) recipeIds.add(fields.recipeId)
    }
  }

  return { locked, eatingOut, recipeKinds: recipeIds.size }
}

function itemKey(item: ShoppingItem) {
  return `${item.ingredient_name}__${item.unit}`
}

function amountLabel(item: ShoppingItem) {
  return `${Math.round(item.amount * 10) / 10}${item.unit}`
}

function sortLocks(a: DbLockedMeal, b: DbLockedMeal) {
  const dayDiff = a.day_of_week - b.day_of_week
  if (dayDiff !== 0) return dayDiff
  return SLOTS.indexOf(a.meal_type as MealSlot) - SLOTS.indexOf(b.meal_type as MealSlot)
}

function getLockValue(lock: DbLockedMeal) {
  return lock.is_eating_out ? EATING_OUT_VALUE : lock.recipe_id ?? ''
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function getPfc(recipe: DbRecipe) {
  const proteinKcal = recipe.nutrition.protein * 4
  const fatKcal = recipe.nutrition.fat * 9
  const carbsKcal = recipe.nutrition.carbs * 4
  const total = proteinKcal + fatKcal + carbsKcal || 1
  return {
    protein: (proteinKcal / total) * 100,
    fat: (fatKcal / total) * 100,
    carbs: (carbsKcal / total) * 100,
  }
}

function DemoRecipeDetail({
  recipe,
  onClose,
}: {
  recipe: DbRecipe
  onClose: () => void
}) {
  const pfc = getPfc(recipe)
  const nutritionItems = [
    { label: 'kcal', value: recipe.nutrition.calories },
    { label: 'P', value: `${recipe.nutrition.protein}g` },
    { label: 'F', value: `${recipe.nutrition.fat}g` },
    { label: 'C', value: `${recipe.nutrition.carbs}g` },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-foreground/35 px-2 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <div
        className="mx-auto flex max-h-[calc(100vh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-card-border bg-card shadow-2xl sm:max-h-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-recipe-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-card-border px-3 py-3 sm:gap-4 sm:px-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-accent">RECIPE DETAIL</p>
            <h2 id="demo-recipe-title" className="mt-1 text-lg font-bold sm:text-xl">
              {recipe.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
              {recipe.cuisine_genre && <span>{recipe.cuisine_genre}</span>}
              {recipe.cooking_method && <span>{recipe.cooking_method}</span>}
              {recipe.cooking_time_minutes != null && (
                <span>{recipe.cooking_time_minutes}分</span>
              )}
              {recipe.difficulty_level != null && (
                <span>難度 {recipe.difficulty_level}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 shrink-0 rounded border border-card-border px-3 py-1 text-xs font-bold text-muted hover:border-accent hover:text-accent"
          >
            閉じる
          </button>
        </div>

        <div className="overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-4">
            <section className="flex flex-col gap-3">
              <div className="rounded border border-card-border p-2.5 sm:p-3">
                <div className="mb-2 text-xs font-bold">栄養</div>
                <div className="grid grid-cols-2 overflow-hidden rounded border border-card-border sm:grid-cols-4">
                  {nutritionItems.map((item) => (
                    <div
                      key={item.label}
                      className="min-h-14 border-r border-card-border bg-background/40 px-2 py-2 last:border-r-0"
                    >
                      <div className="text-[10px] text-muted">{item.label}</div>
                      <div className="font-mono text-sm font-bold break-words">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex h-3 overflow-hidden rounded border border-card-border">
                  <div className="bg-accent" style={{ width: `${pfc.protein}%` }} />
                  <div className="bg-warning" style={{ width: `${pfc.fat}%` }} />
                  <div className="bg-success" style={{ width: `${pfc.carbs}%` }} />
                </div>
                <div className="mt-1 grid grid-cols-3 text-[10px] font-mono text-muted">
                  <span>P {pfc.protein.toFixed(0)}%</span>
                  <span>F {pfc.fat.toFixed(0)}%</span>
                  <span>C {pfc.carbs.toFixed(0)}%</span>
                </div>
              </div>

              <div className="rounded border border-card-border p-2.5 sm:p-3">
                <div className="mb-2 text-xs font-bold">タグ</div>
                <div className="flex flex-wrap gap-1.5">
                  {(recipe.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-card-border bg-background px-2 py-1 text-[10px] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="rounded border border-card-border p-2.5 sm:p-3">
                <div className="mb-2 text-xs font-bold">材料</div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {recipe.ingredients.map((ingredient) => (
                    <li
                      key={`${ingredient.name}__${ingredient.unit}`}
                      className="flex min-h-10 items-center justify-between gap-3 rounded border border-card-border/60 px-2 py-1 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] leading-none text-muted">
                          {ingredient.category}
                        </span>
                        {ingredient.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted">
                        {round1(ingredient.amount)}
                        {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-card-border p-2.5 sm:p-3">
                <div className="mb-2 text-xs font-bold">手順</div>
                <ol className="flex flex-col gap-3">
                  {recipe.steps
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <li
                        key={step.order}
                        className="grid grid-cols-[24px_1fr] gap-2 sm:grid-cols-[28px_1fr]"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-bold text-white sm:h-7 sm:w-7">
                          {step.order}
                        </span>
                        <p className="text-sm leading-relaxed">{step.description}</p>
                      </li>
                    ))}
                </ol>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DemoClient() {
  const [personaId, setPersonaId] = useState<PersonaId>('mei')
  const [seed, setSeed] = useState(INITIAL_SEED)
  const [locks, setLocks] = useState<DbLockedMeal[]>(() =>
    [...DEMO_LOCKED_MEALS].sort(sortLocks),
  )
  const [week, setWeek] = useState(() =>
    buildDemoWeek('mei', INITIAL_SEED, DEMO_LOCKED_MEALS),
  )
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set())
  const [selectedRecipe, setSelectedRecipe] = useState<DbRecipe | null>(null)
  const [lockMessage, setLockMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<DemoSectionId>('week')

  const recipeMap = useMemo(() => {
    const map = new Map<string, DbRecipe>()
    for (const recipe of DEMO_RECIPES) map.set(recipe.id, recipe)
    return map
  }, [])
  const shoppingGrouped = useMemo(
    () =>
      buildShoppingList({
        week,
        recipeMap,
        servings: 1,
        weekStartDate: DEMO_WEEK_START_DATE,
        now: DEMO_NOW,
        inventory: DEMO_INVENTORY,
        pantryItems: DEMO_PANTRY_ITEMS,
      }),
    [recipeMap, week],
  )
  const shoppingItems = useMemo(() => {
    const list: ShoppingItem[] = []
    for (const category of CATEGORY_ORDER) list.push(...shoppingGrouped[category])
    return list
  }, [shoppingGrouped])
  const nutritionSummary = useMemo(
    () => calculateWeekNutrition(week, recipeMap),
    [recipeMap, week],
  )
  const persona = getPersona(personaId)
  const stats = countMeals(week)
  const checkedCount = shoppingItems.filter((item) =>
    checkedItems.has(itemKey(item)),
  ).length
  const remainingShoppingCount = Math.max(shoppingItems.length - checkedCount, 0)

  useEffect(() => {
    if (!selectedRecipe) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedRecipe(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRecipe])

  function regenerate(nextPersonaId = personaId) {
    const nextSeed = seed + 1
    setSeed(nextSeed)
    setWeek(buildDemoWeek(nextPersonaId, nextSeed, locks))
    setCheckedItems(new Set())
  }

  function selectPersona(nextPersonaId: PersonaId) {
    setPersonaId(nextPersonaId)
    setWeek(buildDemoWeek(nextPersonaId, seed + 7, locks))
    setSeed((current) => current + 7)
    setCheckedItems(new Set())
  }

  function updateLock(lockId: string, patch: Partial<DbLockedMeal>) {
    setLocks((current) => {
      const target = current.find((lock) => lock.id === lockId)
      if (!target) return current

      const updated: DbLockedMeal = { ...target, ...patch }
      const hasConflict = current.some(
        (lock) =>
          lock.id !== lockId &&
          lock.day_of_week === updated.day_of_week &&
          lock.meal_type === updated.meal_type,
      )
      if (hasConflict) {
        setLockMessage('その曜日と食事枠には、すでに固定があります')
        return current
      }

      const next = current
        .map((lock) => (lock.id === lockId ? updated : lock))
        .sort(sortLocks)
      setWeek(buildDemoWeek(personaId, seed, next))
      setCheckedItems(new Set())
      setLockMessage('固定サンプルを反映しました')
      return next
    })
  }

  function resetLocks() {
    const next = [...DEMO_LOCKED_MEALS].sort(sortLocks)
    setLocks(next)
    setWeek(buildDemoWeek(personaId, seed + 3, next))
    setSeed((current) => current + 3)
    setCheckedItems(new Set())
    setLockMessage('固定サンプルを初期状態に戻しました')
  }

  function toggleEatingOut(dayIdx: number, slot: MealSlot) {
    const nextWeek: WeekPlan = { ...week }
    const day = { ...(nextWeek[dayIdx] ?? emptyDay()) }
    const key = EATING_OUT_KEY[slot]
    day[key] = !day[key]
    nextWeek[dayIdx] = day
    setWeek(nextWeek)
  }

  function toggleChecked(key: string) {
    setCheckedItems((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-4 sm:py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <section className="hud-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold text-accent">DEMO PREVIEW</p>
              <h1
                className="app-title-shadow mt-1 text-3xl font-bold leading-tight text-accent"
                data-title="完全栄養ランダム献立達人"
              >
                完全栄養ランダム献立達人
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Supabase 接続なしで、献立生成の見た目と固定枠の動きを確認できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/setup"
                className="rounded border border-card-border bg-white px-3 py-2 text-xs font-bold text-muted hover:border-accent hover:text-accent"
              >
                セットアップ
              </Link>
              <button
                type="button"
                onClick={() => regenerate()}
                className="rounded bg-accent px-4 py-2 text-xs font-bold text-white"
              >
                組み直す
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="hud-border min-w-0 bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-xs font-bold text-muted" htmlFor="demo-persona">
                ペルソナ
              </label>
              <select
                id="demo-persona"
                value={personaId}
                onChange={(event) => selectPersona(event.target.value as PersonaId)}
                className="min-w-0 flex-1 rounded border border-card-border bg-white px-3 py-2 text-sm"
              >
                {PERSONA_LIST.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.catchphrase}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-sm text-muted">{persona.catchphrase}</p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-2">
            <div className="hud-border min-w-0 bg-card p-3">
              <div className="text-[10px] text-muted">固定</div>
              <div className="mt-1 font-mono text-xl font-bold">{stats.locked}</div>
            </div>
            <div className="hud-border min-w-0 bg-card p-3">
              <div className="text-[10px] text-muted">外食</div>
              <div className="mt-1 font-mono text-xl font-bold">{stats.eatingOut}</div>
            </div>
            <div className="hud-border min-w-0 bg-card p-3">
              <div className="text-[10px] text-muted">料理</div>
              <div className="mt-1 font-mono text-xl font-bold">{stats.recipeKinds}</div>
            </div>
            <div className="hud-border min-w-0 bg-card p-3">
              <div className="text-[10px] text-muted">買い物残</div>
              <div className="mt-1 font-mono text-xl font-bold">
                {remainingShoppingCount}
              </div>
            </div>
            <div className="hud-border min-w-0 bg-card p-3">
              <div className="text-[10px] text-muted">平均kcal</div>
              <div className="mt-1 flex min-w-0 items-baseline gap-1">
                <span className="font-mono text-xl font-bold">
                  {nutritionSummary.avgKcal}
                </span>
                <span className="text-[10px] text-muted">kcal</span>
              </div>
            </div>
          </div>
        </section>

        <nav
          className="grid grid-cols-2 gap-2 md:grid-cols-4"
          role="tablist"
          aria-label="デモ表示切替"
        >
          {DEMO_SECTIONS.map((section) => {
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`demo-section-${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={`hud-border min-h-16 bg-card px-3 py-2 text-left transition ${
                  isActive
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'text-muted hover:border-accent hover:text-accent'
                }`}
              >
                <span className="block text-sm font-bold text-foreground">
                  {section.label}
                </span>
                <span className="mt-1 block text-[10px] font-mono">
                  {section.subLabel}
                </span>
              </button>
            )
          })}
        </nav>

        {activeSection === 'nutrition' && (
          <section id="demo-section-nutrition" role="tabpanel">
            <NutritionChart
              week={week}
              recipeMap={recipeMap}
              targetCalories={DEMO_TARGET_CALORIES}
              targetPfc={DEMO_TARGET_PFC}
            />
          </section>
        )}

        {activeSection === 'locks' && (
          <section
            id="demo-section-locks"
            role="tabpanel"
            className="hud-border bg-card p-3 sm:p-4"
          >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-sm font-bold">毎週固定サンプル</h2>
              <p className="mt-1 text-xs text-muted">
                曜日・食事・内容を変えると、デモ献立へすぐ反映されます。
              </p>
            </div>
            <button
              type="button"
              onClick={resetLocks}
              className="min-h-10 self-start rounded border border-card-border bg-white px-3 py-1 text-xs font-bold text-muted hover:border-accent hover:text-accent sm:min-h-0 sm:self-auto"
            >
              初期化
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {locks.map((lock) => (
              <div
                key={lock.id}
                className="grid gap-3 rounded border border-card-border p-2.5 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1.6fr)] sm:p-3"
              >
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] text-muted">曜日</span>
                  <select
                    value={lock.day_of_week}
                    onChange={(event) =>
                      updateLock(lock.id, { day_of_week: Number(event.target.value) })
                    }
                    className="min-h-10 w-full rounded border border-card-border bg-white px-3 py-2 text-sm sm:min-h-0 sm:px-2 sm:py-1 sm:text-xs"
                  >
                    {DAY_LABELS.map((label, index) => (
                      <option key={label} value={index}>
                        {label}曜
                      </option>
                    ))}
                  </select>
                </label>

                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] text-muted">食事</span>
                  <select
                    value={lock.meal_type}
                    onChange={(event) =>
                      updateLock(lock.id, { meal_type: event.target.value as MealSlot })
                    }
                    className="min-h-10 w-full rounded border border-card-border bg-white px-3 py-2 text-sm sm:min-h-0 sm:px-2 sm:py-1 sm:text-xs"
                  >
                    {SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {MEAL_SLOT_LABEL[slot]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] text-muted">内容</span>
                  <select
                    value={getLockValue(lock)}
                    onChange={(event) => {
                      const value = event.target.value
                      updateLock(lock.id, {
                        recipe_id: value === EATING_OUT_VALUE ? null : value,
                        is_eating_out: value === EATING_OUT_VALUE,
                      })
                    }}
                    className="min-h-10 w-full rounded border border-card-border bg-white px-3 py-2 text-sm sm:min-h-0 sm:px-2 sm:py-1 sm:text-xs"
                  >
                    <option value={EATING_OUT_VALUE}>外食固定</option>
                    {DEMO_RECIPES.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
          {lockMessage && <p className="mt-2 text-xs text-muted">{lockMessage}</p>}
          </section>
        )}

        {activeSection === 'shopping' && (
          <section
            id="demo-section-shopping"
            role="tabpanel"
            className="hud-border bg-card p-3 sm:p-4"
          >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-sm font-bold">買い物リスト</h2>
              <p className="mt-1 text-xs text-muted">
                在庫 {DEMO_INVENTORY.length} 件 / 常備品 {DEMO_PANTRY_ITEMS.length} 件を反映
              </p>
            </div>
            <div className="font-mono text-xs text-muted">
              {checkedCount}/{shoppingItems.length}
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {CATEGORY_ORDER.map((category) => {
              const items = shoppingGrouped[category]
              if (items.length === 0) return null
              return (
                <div key={category} className="rounded border border-card-border p-2.5 sm:p-3">
                  <div className="mb-2 text-[10px] font-bold text-muted">
                    {category}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => {
                      const key = itemKey(item)
                      const checked = checkedItems.has(key)
                      return (
                        <li key={key}>
                          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleChecked(key)}
                              className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                            />
                            <span
                              className={`min-w-0 flex-1 truncate ${
                                checked ? 'text-muted line-through' : ''
                              }`}
                            >
                              {item.ingredient_name}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-muted">
                              {amountLabel(item)}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
          </section>
        )}

        {activeSection === 'week' && (
          <section
            id="demo-section-week"
            role="tabpanel"
            className="flex flex-col gap-4"
          >
          {DAY_LABELS.map((label, dayIdx) => {
            const day = week[dayIdx] ?? emptyDay()
            return (
              <div key={label}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-sm font-bold text-muted">{label}曜日</h2>
                  <span className="text-[10px] text-muted">
                    {dayIdx === 0 ? '毎週固定あり' : dayIdx === 2 ? '外食固定あり' : ''}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SLOTS.map((slot) => {
                    const fields = getSlotFields(day, slot)
                    const recipe = fields.recipeId
                      ? recipeMap.get(fields.recipeId) ?? null
                      : null
                    return (
                      <MealCard
                        key={slot}
                        slot={slot as WeekMealSlot}
                        recipe={recipe}
                        isLocked={fields.locked}
                        isEatingOut={fields.eatingOut}
                        href={null}
                        onSelect={recipe ? () => setSelectedRecipe(recipe) : undefined}
                        onToggleEatingOut={() => toggleEatingOut(dayIdx, slot)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
          </section>
        )}
      </div>
      {selectedRecipe && (
        <DemoRecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </main>
  )
}
