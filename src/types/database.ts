export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any'
export type CuisineGenre = '和食' | '洋食' | '中華' | 'エスニック' | 'その他'
export type CookingMethod = '焼く' | '煮る' | '揚げる' | '蒸す' | '生'
export type PersonaId = 'mei' | 'arisa' | 'tsuzuri' | 'iris' | 'cleio' | 'milra'

export interface Ingredient {
  name: string
  amount: number
  unit: string
  category: '青果' | '鮮魚' | '精肉' | '乾物' | '調味料' | '乳製品' | 'その他'
}

export interface RecipeStep {
  order: number
  description: string
  image_url?: string
}

export interface NutritionInfo {
  calories: number // kcal
  protein: number // g
  fat: number // g
  carbs: number // g
  fiber: number // g
  vitamins: {
    a: number // μg
    b1: number // mg
    b2: number // mg
    b6: number // mg
    b12: number // μg
    c: number // mg
    d: number // μg
    e: number // mg
  }
  minerals: {
    iron: number // mg
    calcium: number // mg
    zinc: number // mg
    magnesium: number // mg
    potassium: number // mg
    sodium: number // mg (塩分換算はsodium * 2.54 / 1000 g)
  }
}

// DB Row types
export interface DbUser {
  id: string
  display_name: string | null
  default_servings: number
  disliked_ingredients: string[]
  allergic_ingredients: string[]
  selected_persona: PersonaId
  created_at: string
}

export interface DbRecipe {
  id: string
  name: string
  meal_type: MealType
  cuisine_genre: CuisineGenre | null
  cooking_method: CookingMethod | null
  cooking_time_minutes: number | null
  difficulty_level: number | null
  ingredients: Ingredient[]
  steps: RecipeStep[]
  nutrition: NutritionInfo
  base_servings: number
  image_urls: string[] | null
  tags: string[] | null
  created_at: string
}

export interface DayMeals {
  breakfast: string | null // recipe_id or null (外食)
  lunch: string | null
  dinner: string | null
  breakfast_locked: boolean
  lunch_locked: boolean
  dinner_locked: boolean
  is_eating_out_breakfast: boolean
  is_eating_out_lunch: boolean
  is_eating_out_dinner: boolean
}

export interface WeekPlan {
  // 0=月, 1=火, 2=水, 3=木, 4=金, 5=土, 6=日
  [day: number]: DayMeals
}

export interface DbMealPlan {
  id: string
  user_id: string
  week_start_date: string
  plan: WeekPlan
  is_active: boolean
  created_at: string
}

export interface DbLockedMeal {
  id: string
  user_id: string
  day_of_week: number
  meal_type: MealType
  recipe_id: string | null
  is_eating_out: boolean
  note: string | null
}

export interface InventoryItem {
  id: string
  user_id: string
  ingredient_name: string
  amount: number | null
  unit: string | null
  expiry_date: string | null
  added_at: string
}

export interface PantryTemplateItem {
  name: string
  default_amount: number | null
  unit: string | null
  category: Ingredient['category']
}

export interface DbPantryTemplate {
  id: string
  user_id: string
  items: PantryTemplateItem[]
}

export interface DbConditionFlag {
  id: string
  user_id: string
  date: string
  is_tired: boolean
}

export interface ShoppingListItem {
  ingredient_name: string
  amount: number
  unit: string
  category: Ingredient['category']
}

export interface DbShoppingList {
  id: string
  user_id: string
  meal_plan_id: string
  selected_meals: {
    date: string
    meal_types: MealType[]
    servings: number
  }[]
  generated_list: ShoppingListItem[]
  created_at: string
}
