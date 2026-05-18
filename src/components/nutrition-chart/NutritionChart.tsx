'use client'

import { useMemo } from 'react'
import type { DbRecipe, WeekPlan, DayMeals } from '@/types/database'

interface Props {
  week: WeekPlan
  recipeMap: Map<string, DbRecipe>
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']
const SLOTS: (keyof Pick<DayMeals, 'breakfast' | 'lunch' | 'dinner'>)[] = [
  'breakfast',
  'lunch',
  'dinner',
]

interface DayNutrition {
  calories: number
  protein: number
  fat: number
  carbs: number
}

function emptyNutrition(): DayNutrition {
  return { calories: 0, protein: 0, fat: 0, carbs: 0 }
}

function calcDay(day: DayMeals, recipeMap: Map<string, DbRecipe>): DayNutrition {
  const n = emptyNutrition()
  for (const slot of SLOTS) {
    const id = day[slot]
    if (!id) continue
    const r = recipeMap.get(id)
    if (!r) continue
    n.calories += r.nutrition.calories
    n.protein += r.nutrition.protein
    n.fat += r.nutrition.fat
    n.carbs += r.nutrition.carbs
  }
  return n
}

export function NutritionChart({ week, recipeMap }: Props) {
  const { perDay, total, pfcRatio, avgKcal } = useMemo(() => {
    const perDay: DayNutrition[] = []
    const total = emptyNutrition()
    for (let i = 0; i < 7; i++) {
      const d = week[i]
      const n = d ? calcDay(d, recipeMap) : emptyNutrition()
      perDay.push(n)
      total.calories += n.calories
      total.protein += n.protein
      total.fat += n.fat
      total.carbs += n.carbs
    }
    const pKcal = total.protein * 4
    const fKcal = total.fat * 9
    const cKcal = total.carbs * 4
    const sumKcal = pKcal + fKcal + cKcal || 1
    const pfcRatio = {
      p: (pKcal / sumKcal) * 100,
      f: (fKcal / sumKcal) * 100,
      c: (cKcal / sumKcal) * 100,
    }
    const daysWithFood = perDay.filter((d) => d.calories > 0).length || 1
    const avgKcal = Math.round(total.calories / daysWithFood)
    return { perDay, total, pfcRatio, avgKcal }
  }, [week, recipeMap])

  const maxKcal = Math.max(...perDay.map((d) => d.calories), 1)
  const targetKcal = 2000

  return (
    <div className="hud-border bg-card p-3 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold">週の栄養</h3>
        <div className="text-xs text-muted">
          1日平均{' '}
          <span className="font-mono text-foreground">{avgKcal}</span> kcal
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-1">PFCバランス (kcal比)</div>
        <div className="flex h-3 w-full overflow-hidden rounded border border-card-border">
          <div
            className="bg-accent"
            style={{ width: `${pfcRatio.p}%` }}
            title={`P ${pfcRatio.p.toFixed(0)}%`}
          />
          <div
            className="bg-warning"
            style={{ width: `${pfcRatio.f}%` }}
            title={`F ${pfcRatio.f.toFixed(0)}%`}
          />
          <div
            className="bg-success"
            style={{ width: `${pfcRatio.c}%` }}
            title={`C ${pfcRatio.c.toFixed(0)}%`}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono mt-1 text-muted">
          <span>
            <span className="text-accent">P</span> {Math.round(total.protein)}g (
            {pfcRatio.p.toFixed(0)}%)
          </span>
          <span>
            <span className="text-warning">F</span> {Math.round(total.fat)}g (
            {pfcRatio.f.toFixed(0)}%)
          </span>
          <span>
            <span className="text-success">C</span> {Math.round(total.carbs)}g (
            {pfcRatio.c.toFixed(0)}%)
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-1">日別カロリー</div>
        <div className="flex items-end gap-1 h-20">
          {perDay.map((d, i) => {
            const h = (d.calories / Math.max(maxKcal, targetKcal)) * 100
            const reachesTarget = d.calories >= targetKcal
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-16 flex items-end">
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
          目標 {targetKcal} kcal/日
        </div>
      </div>
    </div>
  )
}
