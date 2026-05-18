import type { CookingMethod, CuisineGenre, PersonaId } from '@/types/database'

export interface PersonaPreference {
  id: PersonaId
  name: string
  catchphrase: string
  genres: Partial<Record<CuisineGenre, number>>
  methods: Partial<Record<CookingMethod, number>>
  tags: Record<string, number>
  preferredTimeMax: number
  preferredDifficultyMax: number
  nutritionBias: {
    highProtein?: number
    highFiber?: number
    lowFat?: number
    lowSodium?: number
    highIron?: number
    highCalcium?: number
  }
}

export const PERSONAS: Record<PersonaId, PersonaPreference> = {
  mei: {
    id: 'mei',
    name: 'メイ',
    catchphrase: '王道の家庭和食でほっとひと息',
    genres: { 和食: 1.0, 洋食: 0.4, 中華: 0.3, エスニック: 0.1, その他: 0.3 },
    methods: { 煮る: 1.0, 焼く: 0.8, 蒸す: 0.7, 生: 0.5, 揚げる: 0.3 },
    tags: { 発酵食品: 1.0, 定番: 0.9, 野菜: 0.7, タンパク質: 0.7 },
    preferredTimeMax: 30,
    preferredDifficultyMax: 3,
    nutritionBias: { highFiber: 0.5, lowSodium: 0.4 },
  },
  arisa: {
    id: 'arisa',
    name: 'アリサ',
    catchphrase: '時短で映える洋食派',
    genres: { 洋食: 1.0, エスニック: 0.6, 中華: 0.4, 和食: 0.3, その他: 0.4 },
    methods: { 焼く: 1.0, 生: 0.7, 蒸す: 0.5, 煮る: 0.4, 揚げる: 0.5 },
    tags: { 時短: 1.0, 簡単: 0.9, 映え: 0.8, 卵: 0.5 },
    preferredTimeMax: 15,
    preferredDifficultyMax: 2,
    nutritionBias: { highProtein: 0.5 },
  },
  tsuzuri: {
    id: 'tsuzuri',
    name: 'ツヅリ',
    catchphrase: '本気の中華で食卓を熱く',
    genres: { 中華: 1.0, エスニック: 0.6, 洋食: 0.4, 和食: 0.3, その他: 0.3 },
    methods: { 焼く: 1.0, 揚げる: 0.9, 蒸す: 0.7, 煮る: 0.6, 生: 0.2 },
    tags: { ガッツリ: 1.0, タンパク質: 0.8, 香辛料: 0.7 },
    preferredTimeMax: 45,
    preferredDifficultyMax: 4,
    nutritionBias: { highProtein: 0.8 },
  },
  iris: {
    id: 'iris',
    name: 'イリス',
    catchphrase: '野菜たっぷりヘルシー志向',
    genres: { 和食: 0.8, 洋食: 0.8, エスニック: 0.6, 中華: 0.4, その他: 0.6 },
    methods: { 蒸す: 1.0, 生: 0.9, 煮る: 0.7, 焼く: 0.5, 揚げる: 0.1 },
    tags: { 野菜: 1.0, ヘルシー: 1.0, 発酵食品: 0.6, 食物繊維: 0.8 },
    preferredTimeMax: 30,
    preferredDifficultyMax: 3,
    nutritionBias: { highFiber: 1.0, lowFat: 0.8, lowSodium: 0.6 },
  },
  cleio: {
    id: 'cleio',
    name: 'クレイオ',
    catchphrase: '世界の味を冒険',
    genres: { エスニック: 1.0, 中華: 0.7, 洋食: 0.7, 和食: 0.3, その他: 0.8 },
    methods: { 焼く: 0.9, 煮る: 0.8, 揚げる: 0.7, 蒸す: 0.6, 生: 0.4 },
    tags: { 香辛料: 1.0, エキゾチック: 1.0, タンパク質: 0.6 },
    preferredTimeMax: 45,
    preferredDifficultyMax: 4,
    nutritionBias: { highProtein: 0.4 },
  },
  milra: {
    id: 'milra',
    name: 'ミルラ',
    catchphrase: '甘くてやさしい朝食ブランチ',
    genres: { 洋食: 1.0, その他: 0.7, 和食: 0.4, 中華: 0.2, エスニック: 0.3 },
    methods: { 焼く: 1.0, 蒸す: 0.6, 生: 0.7, 煮る: 0.4, 揚げる: 0.3 },
    tags: { 朝食: 1.0, 卵: 0.8, 乳製品: 0.8, 映え: 0.7 },
    preferredTimeMax: 20,
    preferredDifficultyMax: 2,
    nutritionBias: { highCalcium: 0.8 },
  },
}

export function getPersona(id: PersonaId): PersonaPreference {
  return PERSONAS[id]
}

export const PERSONA_LIST: PersonaPreference[] = Object.values(PERSONAS)
