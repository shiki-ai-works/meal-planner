import type {
  DayMeals,
  DbInventory,
  DbRecipe,
  Ingredient,
  WeekPlan,
} from '@/types/database'

const SLOT_KEYS: (keyof Pick<DayMeals, 'breakfast' | 'lunch' | 'dinner'>)[] = [
  'breakfast',
  'lunch',
  'dinner',
]
const EATING_OUT_KEYS: (keyof Pick<
  DayMeals,
  'is_eating_out_breakfast' | 'is_eating_out_lunch' | 'is_eating_out_dinner'
>)[] = [
  'is_eating_out_breakfast',
  'is_eating_out_lunch',
  'is_eating_out_dinner',
]

// 食事ごとの「消費完了」とみなす時刻（その日の hour）
const SLOT_CONSUMED_HOUR = [9, 14, 21]

const CATEGORY_ORDER: Ingredient['category'][] = [
  '青果',
  '鮮魚',
  '精肉',
  '乳製品',
  '乾物',
  '調味料',
  'その他',
]

export const CATEGORY_EMOJI: Record<Ingredient['category'], string> = {
  青果: '🥬',
  鮮魚: '🐟',
  精肉: '🥩',
  乳製品: '🧀',
  乾物: '🌾',
  調味料: '🧂',
  その他: '📦',
}

export interface ShoppingItem {
  ingredient_name: string
  amount: number // 必要量（買う総量、在庫差し引き後）
  consumed: number // 既に調理・消費された量
  unit: string
  category: Ingredient['category']
}

interface BuildOpts {
  week: WeekPlan
  recipeMap: Map<string, DbRecipe>
  servings: number
  weekStartDate: string // ISO YYYY-MM-DD (月曜)
  now?: Date
  inventory?: DbInventory[]
}

function addDays(iso: string, days: number): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d + days)
}

function isSlotConsumed(weekStart: string, dayIdx: number, slotIdx: number, now: Date) {
  const slotDate = addDays(weekStart, dayIdx)
  slotDate.setHours(SLOT_CONSUMED_HOUR[slotIdx], 0, 0, 0)
  return now.getTime() >= slotDate.getTime()
}

export function buildShoppingList({
  week,
  recipeMap,
  servings,
  weekStartDate,
  now = new Date(),
  inventory = [],
}: BuildOpts): Record<Ingredient['category'], ShoppingItem[]> {
  const merged = new Map<string, ShoppingItem>()

  for (let d = 0; d < 7; d++) {
    const day = week[d]
    if (!day) continue
    for (let i = 0; i < 3; i++) {
      if (day[EATING_OUT_KEYS[i]]) continue
      const recipeId = day[SLOT_KEYS[i]]
      if (!recipeId) continue
      const recipe = recipeMap.get(recipeId)
      if (!recipe) continue
      const scale = servings / (recipe.base_servings || 1)
      const consumed = isSlotConsumed(weekStartDate, d, i, now)
      for (const ing of recipe.ingredients) {
        const key = `${ing.name}__${ing.unit}`
        const addAmount = ing.amount * scale
        const existing = merged.get(key)
        if (existing) {
          existing.amount += addAmount
          if (consumed) existing.consumed += addAmount
        } else {
          merged.set(key, {
            ingredient_name: ing.name,
            amount: addAmount,
            consumed: consumed ? addAmount : 0,
            unit: ing.unit,
            category: ing.category,
          })
        }
      }
    }
  }

  // 在庫を total（buy）量からのみ差し引く（消費トラッキングには影響しない）
  const invByName = new Map<string, number>()
  for (const inv of inventory) {
    if (inv.amount === null || !inv.unit) continue
    const key = `${inv.ingredient_name}__${inv.unit}`
    invByName.set(key, (invByName.get(key) ?? 0) + inv.amount)
  }
  for (const [key, item] of merged) {
    const have = invByName.get(key)
    if (have) item.amount = Math.max(0, item.amount - have)
  }

  const grouped: Record<Ingredient['category'], ShoppingItem[]> = {
    青果: [],
    鮮魚: [],
    精肉: [],
    乾物: [],
    調味料: [],
    乳製品: [],
    その他: [],
  }
  for (const item of merged.values()) {
    if (item.amount <= 0 && item.consumed <= 0) continue
    item.amount = Math.round(item.amount * 10) / 10
    item.consumed = Math.round(item.consumed * 10) / 10
    grouped[item.category].push(item)
  }
  for (const cat of CATEGORY_ORDER) {
    grouped[cat].sort((a, b) =>
      a.ingredient_name.localeCompare(b.ingredient_name, 'ja')
    )
  }
  return grouped
}

export { CATEGORY_ORDER }
