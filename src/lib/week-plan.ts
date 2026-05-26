import type { DayMeals, MealType, WeekPlan } from '@/types/database'

export type MealSlot = Exclude<MealType, 'any'>

export const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'] as const

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: '朝',
  lunch: '昼',
  dinner: '夜',
}

export function getMondayISO(d: Date): string {
  const dayIdx = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayIdx)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function emptyDay(): DayMeals {
  return {
    breakfast: null,
    lunch: null,
    dinner: null,
    breakfast_locked: false,
    lunch_locked: false,
    dinner_locked: false,
    is_eating_out_breakfast: false,
    is_eating_out_lunch: false,
    is_eating_out_dinner: false,
    breakfast_reason: null,
    lunch_reason: null,
    dinner_reason: null,
  }
}

export function emptyWeek(): WeekPlan {
  const week: WeekPlan = {}
  for (let i = 0; i < 7; i++) week[i] = emptyDay()
  return week
}

export function assignRecipeToWeek({
  week,
  dayOfWeek,
  mealType,
  recipeId,
  locked = true,
}: {
  week: WeekPlan | null | undefined
  dayOfWeek: number
  mealType: MealSlot
  recipeId: string
  locked?: boolean
}): WeekPlan {
  const nextWeek: WeekPlan = { ...(week ?? emptyWeek()) }
  const day: DayMeals = { ...(nextWeek[dayOfWeek] ?? emptyDay()) }
  if (mealType === 'breakfast') {
    day.breakfast = recipeId
    day.breakfast_locked = locked
    day.is_eating_out_breakfast = false
    day.breakfast_reason = locked ? '手動で固定した料理' : '手動で選んだ料理'
  } else if (mealType === 'lunch') {
    day.lunch = recipeId
    day.lunch_locked = locked
    day.is_eating_out_lunch = false
    day.lunch_reason = locked ? '手動で固定した料理' : '手動で選んだ料理'
  } else {
    day.dinner = recipeId
    day.dinner_locked = locked
    day.is_eating_out_dinner = false
    day.dinner_reason = locked ? '手動で固定した料理' : '手動で選んだ料理'
  }
  nextWeek[dayOfWeek] = day
  return nextWeek
}
