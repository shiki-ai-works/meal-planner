import type { CuisineGenre, MealType } from '@/types/database'

export type CuisineCategory = 'japanese' | 'chinese' | 'western' | 'other'

export function categorizeCuisine(genre: CuisineGenre | null): CuisineCategory {
  if (genre === '和食') return 'japanese'
  if (genre === '中華') return 'chinese'
  if (genre === '洋食') return 'western'
  return 'other'
}

const CUISINE_BORDER: Record<CuisineCategory, string> = {
  japanese: '#fed7aa',
  chinese: '#fb7185',
  western: '#7dd3fc',
  other: '#c5d0f0',
}

export function cuisineBorderColor(genre: CuisineGenre | null): string {
  return CUISINE_BORDER[categorizeCuisine(genre)]
}

const CUISINE_EMOJI: Record<CuisineCategory, string> = {
  japanese: '🍱',
  chinese: '🥟',
  western: '🍴',
  other: '🍽',
}

const SLOT_EMOJI: Record<Exclude<MealType, 'any'>, string> = {
  breakfast: '🥐',
  lunch: '🍙',
  dinner: '🍲',
}

export function fallbackEmoji(
  genre: CuisineGenre | null,
  slot?: Exclude<MealType, 'any'>,
): string {
  const cat = categorizeCuisine(genre)
  if (cat !== 'other') return CUISINE_EMOJI[cat]
  if (slot) return SLOT_EMOJI[slot]
  return CUISINE_EMOJI.other
}
