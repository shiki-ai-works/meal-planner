import type { DayMeals, DbRecipe, NutritionInfo, WeekPlan } from '@/types/database'

export interface PfcRatio {
  protein: number
  fat: number
  carbs: number
}

export type NutritionFilterMode = 'highProtein' | 'lowFat' | 'lowCarbs'
export type NutritionTotals = Pick<
  NutritionInfo,
  'calories' | 'protein' | 'fat' | 'carbs'
>

export interface WeekNutritionSummary {
  perDay: NutritionTotals[]
  total: NutritionTotals
  pfcRatio: PfcRatio
  avgKcal: number
}

const NUTRITION_SLOT_KEYS: (keyof Pick<
  DayMeals,
  'breakfast' | 'lunch' | 'dinner'
>)[] = ['breakfast', 'lunch', 'dinner']
const EATING_OUT_KEYS: (keyof Pick<
  DayMeals,
  'is_eating_out_breakfast' | 'is_eating_out_lunch' | 'is_eating_out_dinner'
>)[] = [
  'is_eating_out_breakfast',
  'is_eating_out_lunch',
  'is_eating_out_dinner',
]

function emptyNutritionTotals(): NutritionTotals {
  return { calories: 0, protein: 0, fat: 0, carbs: 0 }
}

export function getPfcRatio(
  nutrition: Pick<NutritionInfo, 'protein' | 'fat' | 'carbs'>,
): PfcRatio {
  const proteinKcal = nutrition.protein * 4
  const fatKcal = nutrition.fat * 9
  const carbsKcal = nutrition.carbs * 4
  const total = proteinKcal + fatKcal + carbsKcal || 1

  return {
    protein: (proteinKcal / total) * 100,
    fat: (fatKcal / total) * 100,
    carbs: (carbsKcal / total) * 100,
  }
}

export function matchesNutritionMode(
  nutrition: NutritionInfo,
  mode: NutritionFilterMode,
) {
  const pfc = getPfcRatio(nutrition)

  if (mode === 'highProtein') {
    return nutrition.protein >= 20 || pfc.protein >= 24
  }
  if (mode === 'lowFat') {
    return pfc.fat <= 25
  }
  return pfc.carbs <= 45
}

export function calculateDayNutrition(
  day: DayMeals,
  recipeMap: Map<string, DbRecipe>,
): NutritionTotals {
  const total = emptyNutritionTotals()

  for (let index = 0; index < NUTRITION_SLOT_KEYS.length; index++) {
    if (day[EATING_OUT_KEYS[index]]) continue

    const recipeId = day[NUTRITION_SLOT_KEYS[index]]
    if (!recipeId) continue

    const recipe = recipeMap.get(recipeId)
    if (!recipe) continue

    total.calories += recipe.nutrition.calories
    total.protein += recipe.nutrition.protein
    total.fat += recipe.nutrition.fat
    total.carbs += recipe.nutrition.carbs
  }

  return total
}

export function calculateWeekNutrition(
  week: WeekPlan,
  recipeMap: Map<string, DbRecipe>,
): WeekNutritionSummary {
  const perDay: NutritionTotals[] = []
  const total = emptyNutritionTotals()

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const day = week[dayIndex]
    const dayNutrition = day
      ? calculateDayNutrition(day, recipeMap)
      : emptyNutritionTotals()

    perDay.push(dayNutrition)
    total.calories += dayNutrition.calories
    total.protein += dayNutrition.protein
    total.fat += dayNutrition.fat
    total.carbs += dayNutrition.carbs
  }

  const daysWithFood = perDay.filter((day) => day.calories > 0).length || 1

  return {
    perDay,
    total,
    pfcRatio: getPfcRatio(total),
    avgKcal: Math.round(total.calories / daysWithFood),
  }
}
