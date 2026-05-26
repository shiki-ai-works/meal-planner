import type { DayMeals, DbRecipe, WeekPlan } from '@/types/database'
import type { PlanningGoal, SelfCookFrequency } from '@/lib/onboarding'
import {
  buildInventoryIndex,
  getRecipeInventoryMatch,
  type RecipeInventoryMatch,
} from '@/lib/ingredient-match'
import { getPersona } from '@/lib/personas'
import type { PersonaPreference } from '@/lib/personas'
import { emptyDay } from '@/lib/week-plan'
import { filterRecipes } from './filter'
import { scoreRecipe } from './scorer'
import type { GenerateInput, GenerateOutput, MealSlot, ScoredRecipe } from './types'

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weightedPick(
  scored: ScoredRecipe[],
  rand: () => number,
  exclude: Set<string>
): DbRecipe | null {
  const pool = scored.filter((s) => !exclude.has(s.recipe.id) && s.score > 0)
  if (pool.length === 0) {
    const fallback = scored.filter((s) => !exclude.has(s.recipe.id))
    if (fallback.length === 0) return null
    return fallback[Math.floor(rand() * fallback.length)].recipe
  }
  const total = pool.reduce((acc, s) => acc + s.score, 0)
  let r = rand() * total
  for (const s of pool) {
    r -= s.score
    if (r <= 0) return s.recipe
  }
  return pool[pool.length - 1].recipe
}

function inventoryScore(match: RecipeInventoryMatch) {
  if (match.targetCount === 0) return 0
  return (match.score / 100) * 1.4 + Math.min(match.matchedCount, 2) * 0.25
}

function preferenceScore({
  match,
  planningGoal,
  recipe,
  selfCookFrequency,
}: {
  match: RecipeInventoryMatch
  planningGoal?: PlanningGoal
  recipe: DbRecipe
  selfCookFrequency?: SelfCookFrequency
}) {
  let score = 0

  if (planningGoal === 'time_saving' && (recipe.cooking_time_minutes ?? 999) <= 20) {
    score += 1.2
  }
  if (planningGoal === 'budget' && match.matchedCount > 0) {
    score += 1.1
  }
  if (
    planningGoal === 'protein' &&
    (recipe.nutrition.protein >= 25 || recipe.tags?.includes('タンパク質'))
  ) {
    score += 1.1
  }
  if (planningGoal === 'family' && (recipe.difficulty_level ?? 3) <= 2) {
    score += 0.7
  }
  if (planningGoal === 'balanced' && recipe.nutrition.fiber >= 5) {
    score += 0.5
  }
  if (
    selfCookFrequency === 'rarely' &&
    ((recipe.cooking_time_minutes ?? 999) <= 20 || (recipe.difficulty_level ?? 3) <= 2)
  ) {
    score += 0.8
  }

  return score
}

function setReason(day: DayMeals, slot: MealSlot, reason: string) {
  if (slot === 'breakfast') day.breakfast_reason = reason
  else if (slot === 'lunch') day.lunch_reason = reason
  else day.dinner_reason = reason
}

function buildPickReason({
  match,
  persona,
  planningGoal,
  recipe,
  selfCookFrequency,
  slot,
  usedRecentCount,
}: {
  match: RecipeInventoryMatch
  persona: PersonaPreference
  planningGoal?: PlanningGoal
  recipe: DbRecipe
  selfCookFrequency?: SelfCookFrequency
  slot: MealSlot
  usedRecentCount: number
}) {
  if (match.matchedIngredients.length > 0) {
    return `在庫の${match.matchedIngredients[0]}を使うため`
  }
  if (planningGoal === 'time_saving' && (recipe.cooking_time_minutes ?? 999) <= 20) {
    return '時短の目標に合うため'
  }
  if (
    planningGoal === 'protein' &&
    (recipe.nutrition.protein >= 25 || recipe.tags?.includes('タンパク質'))
  ) {
    return '高たんぱくの目標に合うため'
  }
  if (planningGoal === 'family' && (recipe.difficulty_level ?? 3) <= 2) {
    return '家族で続けやすい簡単さを優先'
  }
  if (
    selfCookFrequency === 'rarely' &&
    ((recipe.cooking_time_minutes ?? 999) <= 20 || (recipe.difficulty_level ?? 3) <= 2)
  ) {
    return '自炊を始めやすい料理を優先'
  }
  if (slot === 'dinner' && recipe.nutrition.calories <= 500) {
    return '夜を軽めにするため'
  }
  if (slot === 'lunch' && recipe.nutrition.calories >= 600) {
    return '昼にしっかり食べるため'
  }
  if (
    recipe.cooking_time_minutes != null &&
    recipe.cooking_time_minutes <= persona.preferredTimeMax
  ) {
    return `${recipe.cooking_time_minutes}分で作れるため`
  }
  if (recipe.nutrition.protein >= 25 || recipe.tags?.includes('タンパク質')) {
    return 'たんぱく質を補いやすいため'
  }
  if (recipe.nutrition.fiber >= 5 || recipe.tags?.includes('野菜')) {
    return '野菜と食物繊維を足しやすいため'
  }
  if (usedRecentCount > 0) {
    return '最近の重複を避けて選択'
  }
  if (recipe.cuisine_genre) {
    return `${recipe.cuisine_genre}の好みに合わせて選択`
  }
  return '栄養バランスを見て選択'
}

export function generateWeekPlan(input: GenerateInput): GenerateOutput {
  const persona = getPersona(input.personaId)
  const rand = mulberry32(input.seed ?? Date.now())
  const inventoryIndex = buildInventoryIndex(input.inventoryNames ?? [])
  const inventoryMatches = new Map<string, RecipeInventoryMatch>()
  const getInventoryMatch = (recipe: DbRecipe) => {
    const cached = inventoryMatches.get(recipe.id)
    if (cached) return cached
    const match = getRecipeInventoryMatch(recipe, inventoryIndex)
    inventoryMatches.set(recipe.id, match)
    return match
  }

  const scoredBySlot: Record<MealSlot, ScoredRecipe[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  }
  for (const slot of SLOTS) {
    const filtered = filterRecipes(
      input.recipes,
      slot,
      input.dislikedIngredients,
      input.allergicIngredients
    )
    scoredBySlot[slot] = filtered.map((r) => {
      const match = getInventoryMatch(r)
      return {
        recipe: r,
        score:
          scoreRecipe(r, persona) +
          inventoryScore(match) +
          preferenceScore({
            match,
            planningGoal: input.planningGoal,
            recipe: r,
            selfCookFrequency: input.selfCookFrequency,
          }),
      }
    })
  }

  const usedRecent = new Set<string>()
  const recentOrder: string[] = []
  const RECENT_WINDOW = 5

  const week: WeekPlan = {}
  for (let day = 0; day < 7; day++) {
    week[day] = emptyDay()
  }

  for (const lock of input.lockedMeals) {
    const day = week[lock.day_of_week]
    if (!day || lock.meal_type === 'any') continue
    const slot = lock.meal_type as MealSlot
    if (slot === 'breakfast') {
      day.breakfast = lock.recipe_id
      day.breakfast_locked = true
      day.is_eating_out_breakfast = lock.is_eating_out
    } else if (slot === 'lunch') {
      day.lunch = lock.recipe_id
      day.lunch_locked = true
      day.is_eating_out_lunch = lock.is_eating_out
    } else {
      day.dinner = lock.recipe_id
      day.dinner_locked = true
      day.is_eating_out_dinner = lock.is_eating_out
    }
    if (lock.recipe_id) {
      usedRecent.add(lock.recipe_id)
      recentOrder.push(lock.recipe_id)
    }
    setReason(
      day,
      slot,
      lock.is_eating_out ? '固定の外食枠を反映' : '固定枠を優先',
    )
  }

  for (let day = 0; day < 7; day++) {
    for (const slot of SLOTS) {
      const d = week[day]
      const lockedFlag =
        slot === 'breakfast' ? d.breakfast_locked : slot === 'lunch' ? d.lunch_locked : d.dinner_locked
      if (lockedFlag) continue

      const picked = weightedPick(scoredBySlot[slot], rand, usedRecent)
      if (!picked) continue
      const reason = buildPickReason({
        match: getInventoryMatch(picked),
        persona,
        planningGoal: input.planningGoal,
        recipe: picked,
        selfCookFrequency: input.selfCookFrequency,
        slot,
        usedRecentCount: usedRecent.size,
      })

      if (slot === 'breakfast') d.breakfast = picked.id
      else if (slot === 'lunch') d.lunch = picked.id
      else d.dinner = picked.id
      setReason(d, slot, reason)

      usedRecent.add(picked.id)
      recentOrder.push(picked.id)
      while (recentOrder.length > RECENT_WINDOW) {
        const old = recentOrder.shift()!
        usedRecent.delete(old)
      }
    }
  }

  return { weekPlan: week }
}
