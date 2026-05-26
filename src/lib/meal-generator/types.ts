import type {
  DbLockedMeal,
  DbRecipe,
  MealType,
  PersonaId,
  WeekPlan,
} from '@/types/database'
import type { PlanningGoal, SelfCookFrequency } from '@/lib/onboarding'

export interface GenerateInput {
  recipes: DbRecipe[]
  personaId: PersonaId
  dislikedIngredients: string[]
  allergicIngredients: string[]
  lockedMeals: DbLockedMeal[]
  inventoryNames?: string[]
  planningGoal?: PlanningGoal
  selfCookFrequency?: SelfCookFrequency
  seed?: number
}

export interface GenerateOutput {
  weekPlan: WeekPlan
}

export interface ScoredRecipe {
  recipe: DbRecipe
  score: number
}

export type MealSlot = Exclude<MealType, 'any'>
