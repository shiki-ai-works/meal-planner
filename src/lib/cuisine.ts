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

const CUISINE_BACKGROUND: Record<CuisineCategory, string> = {
  japanese:
    'radial-gradient(circle at 20% 12%, rgba(255,247,237,0.95) 0 20%, transparent 38%), linear-gradient(135deg, #fff7ed 0%, #fed7aa 54%, #ffffff 100%)',
  chinese:
    'radial-gradient(circle at 80% 14%, rgba(255,228,230,0.95) 0 18%, transparent 36%), linear-gradient(135deg, #fff1f2 0%, #fb7185 58%, #fff7ed 100%)',
  western:
    'radial-gradient(circle at 18% 18%, rgba(224,242,254,0.96) 0 22%, transparent 40%), linear-gradient(135deg, #eff6ff 0%, #7dd3fc 56%, #ffffff 100%)',
  other:
    'radial-gradient(circle at 80% 16%, rgba(240,244,255,0.95) 0 22%, transparent 40%), linear-gradient(135deg, #f8fafc 0%, #c5d0f0 58%, #ffffff 100%)',
}

export function cuisineBorderColor(genre: CuisineGenre | null): string {
  return CUISINE_BORDER[categorizeCuisine(genre)]
}

export function cuisineBackground(genre: CuisineGenre | null): string {
  return CUISINE_BACKGROUND[categorizeCuisine(genre)]
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
