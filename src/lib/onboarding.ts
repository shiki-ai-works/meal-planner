import type { DbUser } from '@/types/database'

export type SelfCookFrequency = 'rarely' | 'sometimes' | 'often'
export type PlanningGoal = 'balanced' | 'time_saving' | 'budget' | 'protein' | 'family'

export const SELF_COOK_FREQUENCY_OPTIONS: {
  value: SelfCookFrequency
  label: string
  description: string
}[] = [
  {
    value: 'sometimes',
    label: '週に数回',
    description: '外食や中食も使いながら、無理なく自炊する',
  },
  {
    value: 'often',
    label: 'ほぼ毎日',
    description: '作り置きや買い物効率を重視して組み立てる',
  },
  {
    value: 'rarely',
    label: 'これから増やす',
    description: '時短と簡単さを優先して、始めやすくする',
  },
]

export const PLANNING_GOAL_OPTIONS: {
  value: PlanningGoal
  label: string
  description: string
}[] = [
  {
    value: 'balanced',
    label: '栄養バランス',
    description: 'PFC とカロリーを見ながら、偏りを抑える',
  },
  {
    value: 'time_saving',
    label: '時短',
    description: '短時間で作れる献立を優先する',
  },
  {
    value: 'budget',
    label: '節約',
    description: '買い足しが少なく、使い回しやすい食材を重視する',
  },
  {
    value: 'protein',
    label: '高たんぱく',
    description: 'たんぱく質を意識した献立に寄せる',
  },
  {
    value: 'family',
    label: '家族向け',
    description: '食べやすさと続けやすさを優先する',
  },
]

export function isUserOnboarded(user: Pick<DbUser, 'onboarding_completed_at'> | null) {
  return Boolean(user?.onboarding_completed_at)
}
