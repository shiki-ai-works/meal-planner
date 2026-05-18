'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MealCard, type MealSlot } from '@/components/meal-card'
import { NutritionChart } from '@/components/nutrition-chart'
import { PERSONA_LIST } from '@/lib/personas'
import type {
  DbMealPlan,
  DbRecipe,
  DayMeals,
  PersonaId,
  WeekPlan,
} from '@/types/database'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']
const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

interface Props {
  weekStartDate: string
  initialPlan: DbMealPlan | null
  recipes: DbRecipe[]
  initialPersonaId: PersonaId
}

function emptyDay(): DayMeals {
  return {
    breakfast: null,
    lunch: null,
    dinner: null,
    breakfast_locked: false,
    lunch_locked: false,
    dinner_locked: false,
    is_eating_out_breakfast: false,
    is_eating_out_lunch: false,
    is_eating_out_dinner: false,
  }
}

function emptyWeek(): WeekPlan {
  const w: WeekPlan = {}
  for (let i = 0; i < 7; i++) w[i] = emptyDay()
  return w
}

function getSlotFields(day: DayMeals, slot: MealSlot) {
  if (slot === 'breakfast') {
    return {
      recipeId: day.breakfast,
      locked: day.breakfast_locked,
      eatingOut: day.is_eating_out_breakfast,
    }
  }
  if (slot === 'lunch') {
    return {
      recipeId: day.lunch,
      locked: day.lunch_locked,
      eatingOut: day.is_eating_out_lunch,
    }
  }
  return {
    recipeId: day.dinner,
    locked: day.dinner_locked,
    eatingOut: day.is_eating_out_dinner,
  }
}

export function WeekCalendar({
  weekStartDate,
  initialPlan,
  recipes,
  initialPersonaId,
}: Props) {
  const router = useRouter()
  const [plan, setPlan] = useState<DbMealPlan | null>(initialPlan)
  const [personaId, setPersonaId] = useState<PersonaId>(initialPersonaId)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const recipeMap = useMemo(() => {
    const m = new Map<string, DbRecipe>()
    for (const r of recipes) m.set(r.id, r)
    return m
  }, [recipes])

  const week: WeekPlan = plan?.plan ?? emptyWeek()

  async function handleGenerate() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaId, weekStartDate }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const data = await res.json()
        setPlan(data.mealPlan as DbMealPlan)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成に失敗しました')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="hud-border bg-card p-3 flex items-center gap-3">
        <label className="text-xs text-muted">ペルソナ</label>
        <select
          value={personaId}
          onChange={(e) => setPersonaId(e.target.value as PersonaId)}
          className="flex-1 bg-transparent border border-card-border rounded px-2 py-1 text-sm"
        >
          {PERSONA_LIST.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.catchphrase}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? '生成中…' : '献立を生成'}
        </button>
      </div>

      {error && (
        <div className="hud-border bg-card p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!plan && !isPending && (
        <p className="text-sm text-muted text-center">
          まだ今週の献立がありません。「献立を生成」を押してください。
        </p>
      )}

      {plan && <NutritionChart week={week} recipeMap={recipeMap} />}

      <div className="flex flex-col gap-4">
        {DAY_LABELS.map((label, dayIdx) => {
          const day = week[dayIdx] ?? emptyDay()
          return (
            <div key={dayIdx}>
              <h3 className="text-sm font-bold text-muted mb-2">
                {label}曜日
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((slot) => {
                  const f = getSlotFields(day, slot)
                  const recipe = f.recipeId ? recipeMap.get(f.recipeId) ?? null : null
                  return (
                    <MealCard
                      key={slot}
                      slot={slot}
                      recipe={recipe}
                      isLocked={f.locked}
                      isEatingOut={f.eatingOut}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
