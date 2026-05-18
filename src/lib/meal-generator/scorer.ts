import type { DbRecipe } from '@/types/database'
import type { PersonaPreference } from '@/lib/personas'

const W_GENRE = 2.0
const W_METHOD = 1.5
const W_TAG = 1.2
const W_TIME = 1.0
const W_NUTRITION = 1.0
const W_DIFFICULTY = 0.8

function timeScore(timeMin: number | null, preferredMax: number): number {
  if (timeMin == null) return 0.5
  if (timeMin <= preferredMax) return 1
  const over = timeMin - preferredMax
  return Math.max(0, 1 - over / 60)
}

function difficultyScore(d: number | null, preferredMax: number): number {
  if (d == null) return 0.5
  if (d <= preferredMax) return 1
  return Math.max(0, 1 - (d - preferredMax) * 0.3)
}

function nutritionScore(r: DbRecipe, p: PersonaPreference): number {
  const n = r.nutrition
  if (!n) return 0
  const bias = p.nutritionBias
  let s = 0
  let totalW = 0
  if (bias.highProtein != null) {
    totalW += bias.highProtein
    s += bias.highProtein * Math.min(1, n.protein / 25)
  }
  if (bias.highFiber != null) {
    totalW += bias.highFiber
    s += bias.highFiber * Math.min(1, n.fiber / 6)
  }
  if (bias.lowFat != null) {
    totalW += bias.lowFat
    s += bias.lowFat * Math.max(0, 1 - n.fat / 25)
  }
  if (bias.lowSodium != null) {
    totalW += bias.lowSodium
    s += bias.lowSodium * Math.max(0, 1 - (n.minerals?.sodium ?? 0) / 1500)
  }
  if (bias.highIron != null) {
    totalW += bias.highIron
    s += bias.highIron * Math.min(1, (n.minerals?.iron ?? 0) / 4)
  }
  if (bias.highCalcium != null) {
    totalW += bias.highCalcium
    s += bias.highCalcium * Math.min(1, (n.minerals?.calcium ?? 0) / 300)
  }
  return totalW > 0 ? s / totalW : 0
}

export function scoreRecipe(r: DbRecipe, p: PersonaPreference): number {
  const genreScore = r.cuisine_genre ? p.genres[r.cuisine_genre] ?? 0 : 0
  const methodScore = r.cooking_method ? p.methods[r.cooking_method] ?? 0 : 0
  let tagScore = 0
  if (r.tags) {
    for (const t of r.tags) {
      tagScore += p.tags[t] ?? 0
    }
    if (r.tags.length > 0) tagScore /= r.tags.length
  }
  const tScore = timeScore(r.cooking_time_minutes, p.preferredTimeMax)
  const dScore = difficultyScore(r.difficulty_level, p.preferredDifficultyMax)
  const nScore = nutritionScore(r, p)

  return (
    W_GENRE * genreScore +
    W_METHOD * methodScore +
    W_TAG * tagScore +
    W_TIME * tScore +
    W_NUTRITION * nScore +
    W_DIFFICULTY * dScore
  )
}
