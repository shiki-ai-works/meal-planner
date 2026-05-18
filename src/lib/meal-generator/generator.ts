import type { DayMeals, DbRecipe, WeekPlan } from '@/types/database'
import { getPersona } from '@/lib/personas'
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

function emptyDay(): DayMeals {
  return {
    breakfast: null,
    lunch: null,
    dinner: null,
    breakfast_locked: false,
    lunch_locked: false,
    is_eating_out_breakfast: false,
    is_eating_out_lunch: false,
    is_eating_out_dinner: false,
    dinner_locked: false,
  }
}

export function generateWeekPlan(input: GenerateInput): GenerateOutput {
  const persona = getPersona(input.personaId)
  const rand = mulberry32(input.seed ?? Date.now())

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
    scoredBySlot[slot] = filtered.map((r) => ({
      recipe: r,
      score: scoreRecipe(r, persona),
    }))
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
  }

  for (let day = 0; day < 7; day++) {
    for (const slot of SLOTS) {
      const d = week[day]
      const lockedFlag =
        slot === 'breakfast' ? d.breakfast_locked : slot === 'lunch' ? d.lunch_locked : d.dinner_locked
      if (lockedFlag) continue

      const picked = weightedPick(scoredBySlot[slot], rand, usedRecent)
      if (!picked) continue

      if (slot === 'breakfast') d.breakfast = picked.id
      else if (slot === 'lunch') d.lunch = picked.id
      else d.dinner = picked.id

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
