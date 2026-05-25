'use client'

import { useMemo } from 'react'
import { calculateWeekNutrition } from '@/lib/nutrition'
import type { DbRecipe, WeekPlan } from '@/types/database'

interface Props {
  week: WeekPlan
  recipeMap: Map<string, DbRecipe>
  targetCalories?: number
  targetPfc?: { protein: number; fat: number; carbs: number }
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']
const PFC_LABELS = [
  { key: 'protein', label: 'タンパク質', colorClass: 'text-accent' },
  { key: 'fat', label: '脂質', colorClass: 'text-warning' },
  { key: 'carbs', label: '炭水化物', colorClass: 'text-success' },
] as const

export function NutritionChart({
  week,
  recipeMap,
  targetCalories = 2000,
  targetPfc = { protein: 20, fat: 25, carbs: 55 },
}: Props) {
  const { perDay, total, pfcRatio, avgKcal } = useMemo(
    () => calculateWeekNutrition(week, recipeMap),
    [week, recipeMap],
  )

  const maxKcal = Math.max(...perDay.map((d) => d.calories), 1)
  const targetKcal = targetCalories

  return (
    <div className="hud-border bg-card p-3 flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-sm font-bold">カロリーバランス</h3>
        <div className="text-xs text-muted">
          1日平均{' '}
          <span className="font-mono text-foreground">{avgKcal}</span> kcal
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-1 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <span>三大栄養素の割合 (kcal比)</span>
          <span>
            目標:{' '}
            <span className="font-mono">
              タンパク質 {targetPfc.protein}% / 脂質 {targetPfc.fat}% /
              炭水化物 {targetPfc.carbs}%
            </span>
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded border border-card-border">
          <div
            className="bg-accent"
            style={{ width: `${pfcRatio.protein}%` }}
            title={`タンパク質 ${pfcRatio.protein.toFixed(0)}%`}
          />
          <div
            className="bg-warning"
            style={{ width: `${pfcRatio.fat}%` }}
            title={`脂質 ${pfcRatio.fat.toFixed(0)}%`}
          />
          <div
            className="bg-success"
            style={{ width: `${pfcRatio.carbs}%` }}
            title={`炭水化物 ${pfcRatio.carbs.toFixed(0)}%`}
          />
        </div>
        <div className="relative mt-1 h-4">
          <span className="absolute left-0 top-0 text-[10px] text-muted">
            目標
          </span>
          <span
            className="absolute top-0 -translate-x-1/2 text-[10px] font-bold text-muted"
            style={{ left: `${targetPfc.protein}%` }}
            title="目標: タンパク質と脂質の境目"
          >
            ↑
          </span>
          <span
            className="absolute top-0 -translate-x-1/2 text-[10px] font-bold text-muted"
            style={{ left: `${targetPfc.protein + targetPfc.fat}%` }}
            title="目標: 脂質と炭水化物の境目"
          >
            ↑
          </span>
        </div>
        <div className="mt-1 grid gap-1 text-[10px] text-muted sm:grid-cols-3">
          {PFC_LABELS.map((item) => {
            const grams = Math.round(total[item.key])
            const ratio = pfcRatio[item.key].toFixed(0)
            return (
              <span key={item.key} className="min-w-0">
                <span className={item.colorClass}>{item.label}</span>{' '}
                <span className="font-mono">
                  {grams}g ({ratio}%)
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-1">日別カロリー</div>
        <div className="flex h-20 min-w-0 items-end gap-1">
          {perDay.map((d, i) => {
            const h = (d.calories / Math.max(maxKcal, targetKcal)) * 100
            const reachesTarget = d.calories >= targetKcal
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex h-16 w-full items-end">
                  <div
                    className={`w-full rounded-t ${
                      reachesTarget ? 'bg-success' : 'bg-accent/60'
                    }`}
                    style={{ height: `${h}%` }}
                    title={`${DAY_LABELS[i]}: ${Math.round(d.calories)} kcal`}
                  />
                </div>
                <div className="text-[10px] text-muted">{DAY_LABELS[i]}</div>
              </div>
            )
          })}
        </div>
        <div className="text-[10px] text-muted mt-1 text-right">
          目標 {targetKcal.toLocaleString()} kcal/日
        </div>
      </div>
    </div>
  )
}
