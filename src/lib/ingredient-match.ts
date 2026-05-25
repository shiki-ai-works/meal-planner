import type { DbRecipe, Ingredient } from '@/types/database'

export type IngredientMatchKind = 'exact' | 'alias' | 'partial'

export interface RecipeInventoryMatch {
  matchedCount: number
  targetCount: number
  score: number
  matchedIngredients: string[]
  missingIngredients: string[]
  matchedInventoryNames: string[]
}

interface InventoryCandidate {
  raw: string
  normalized: string
  aliases: Set<string>
}

export interface InventoryIndex {
  candidates: InventoryCandidate[]
}

const OPTIONAL_CATEGORIES = new Set<Ingredient['category']>(['調味料'])

const ALIAS_GROUPS = [
  ['鶏肉', '鶏もも肉', '鶏もも', '鶏むね肉', '鶏胸肉', '鶏ひき肉', '鳥肉', 'とり肉', 'チキン'],
  ['豚肉', '豚ロース薄切り', '豚バラ薄切り', '豚バラブロック', '豚こま切れ', '豚こま', '豚ひき肉', 'ポーク'],
  ['牛肉', '牛バラ薄切り肉', '牛薄切り肉', '牛こま切れ', 'ビーフ'],
  ['ひき肉', '挽き肉', 'ミンチ', '合いびき肉', '合挽き肉'],
  ['卵', 'たまご', '玉子'],
  ['玉ねぎ', 'たまねぎ', 'タマネギ', '玉葱'],
  ['にんじん', '人参', 'ニンジン'],
  ['じゃがいも', 'ジャガイモ', '馬鈴薯', 'メークイン', '男爵'],
  ['キャベツ', 'きゃべつ'],
  ['きゅうり', 'キュウリ', '胡瓜'],
  ['トマト', 'ミニトマト', 'トマト缶', 'カットトマト'],
  ['長ねぎ', '長ネギ', 'ねぎ', 'ネギ', '青ねぎ', '長葱'],
  ['生姜', 'しょうが', 'ショウガ'],
  ['にんにく', 'ニンニク', '大蒜'],
  ['ご飯', 'ごはん', '白ご飯', '米', '白米'],
  ['牛乳', 'ミルク'],
  ['豆腐', 'とうふ', 'トウフ'],
  ['大根', 'だいこん', 'ダイコン'],
  ['鮭', 'サケ', 'さけ', 'サーモン'],
  ['鯖', 'さば', 'サバ'],
  ['鯵', 'あじ', 'アジ'],
  ['うどん', '冷凍うどん'],
  ['パスタ', 'スパゲティ', 'スパゲッティ'],
  ['カレールー', 'カレー粉', 'カレー'],
] as const

const NORMALIZED_ALIAS_GROUPS = ALIAS_GROUPS.map((group, index) => ({
  key: `alias:${index}`,
  terms: group.map((term) => normalizeIngredientName(term)),
}))

const GENERIC_PARTIAL_NAMES = new Set([
  normalizeIngredientName('肉'),
  normalizeIngredientName('魚'),
  normalizeIngredientName('野菜'),
  normalizeIngredientName('スープ'),
  normalizeIngredientName('カレー'),
])

export function normalizeIngredientName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\s　・･、,，。.\-－—–（）()【】\[\]［］]/g, '')
}

export function buildInventoryIndex(names: string[]): InventoryIndex {
  const seen = new Set<string>()
  const candidates: InventoryCandidate[] = []

  for (const rawName of names) {
    const raw = rawName.trim()
    const normalized = normalizeIngredientName(raw)
    if (!raw || !normalized || seen.has(normalized)) continue

    seen.add(normalized)
    candidates.push({
      raw,
      normalized,
      aliases: aliasTokensFor(normalized),
    })
  }

  return { candidates }
}

export function getRecipeInventoryMatch(
  recipe: DbRecipe,
  inventoryIndex: InventoryIndex,
): RecipeInventoryMatch {
  const targetIngredients = dedupeIngredients(
    recipe.ingredients.filter((ingredient) => !isOptionalIngredient(ingredient)),
  )
  const matchedIngredients: string[] = []
  const missingIngredients: string[] = []
  const matchedInventoryNames = new Set<string>()

  for (const ingredient of targetIngredients) {
    const match = findInventoryMatch(ingredient.name, inventoryIndex)
    if (match) {
      matchedIngredients.push(ingredient.name)
      matchedInventoryNames.add(match.raw)
    } else {
      missingIngredients.push(ingredient.name)
    }
  }

  const matchedCount = matchedIngredients.length
  const targetCount = targetIngredients.length

  return {
    matchedCount,
    targetCount,
    score: targetCount === 0 ? 0 : Math.round((matchedCount / targetCount) * 100),
    matchedIngredients,
    missingIngredients,
    matchedInventoryNames: [...matchedInventoryNames],
  }
}

function isOptionalIngredient(ingredient: Ingredient) {
  return OPTIONAL_CATEGORIES.has(ingredient.category)
}

function dedupeIngredients(ingredients: Ingredient[]) {
  const seen = new Set<string>()
  const result: Ingredient[] = []

  for (const ingredient of ingredients) {
    const normalized = normalizeIngredientName(ingredient.name)
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(ingredient)
  }

  return result
}

function findInventoryMatch(ingredientName: string, inventoryIndex: InventoryIndex) {
  const normalized = normalizeIngredientName(ingredientName)
  if (!normalized) return null

  for (const candidate of inventoryIndex.candidates) {
    if (candidate.normalized === normalized) {
      return { ...candidate, kind: 'exact' satisfies IngredientMatchKind }
    }
  }

  const ingredientAliases = aliasTokensFor(normalized)
  for (const candidate of inventoryIndex.candidates) {
    for (const alias of ingredientAliases) {
      if (candidate.aliases.has(alias)) {
        return { ...candidate, kind: 'alias' satisfies IngredientMatchKind }
      }
    }
  }

  for (const candidate of inventoryIndex.candidates) {
    if (canPartialMatch(normalized, candidate.normalized)) {
      return { ...candidate, kind: 'partial' satisfies IngredientMatchKind }
    }
  }

  return null
}

function aliasTokensFor(normalizedName: string) {
  const aliases = new Set<string>([normalizedName])

  for (const group of NORMALIZED_ALIAS_GROUPS) {
    if (group.terms.some((term) => isAliasTermMatch(normalizedName, term))) {
      aliases.add(group.key)
    }
  }

  return aliases
}

function isAliasTermMatch(name: string, term: string) {
  if (name === term) return true
  if (term.length < 2) return false
  return name.includes(term) || (name.length >= 3 && term.includes(name))
}

function canPartialMatch(a: string, b: string) {
  const shorter = a.length <= b.length ? a : b
  if (shorter.length < 3 || GENERIC_PARTIAL_NAMES.has(shorter)) return false
  return a.includes(b) || b.includes(a)
}
