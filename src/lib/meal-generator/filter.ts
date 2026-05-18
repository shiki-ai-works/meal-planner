import type { DbRecipe } from '@/types/database'
import type { MealSlot } from './types'

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

export function filterRecipes(
  recipes: DbRecipe[],
  slot: MealSlot,
  dislikedIngredients: string[],
  allergicIngredients: string[]
): DbRecipe[] {
  const disliked = new Set(dislikedIngredients.map(normalize))
  const allergic = new Set(allergicIngredients.map(normalize))

  return recipes.filter((r) => {
    if (r.meal_type !== slot && r.meal_type !== 'any') return false
    for (const ing of r.ingredients ?? []) {
      const n = normalize(ing.name)
      if (allergic.has(n)) return false
      if (disliked.has(n)) return false
    }
    return true
  })
}
