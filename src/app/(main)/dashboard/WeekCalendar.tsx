'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: '朝',
  lunch: '昼',
  dinner: '夜',
}

type EatingOutKey =
  | 'is_eating_out_breakfast'
  | 'is_eating_out_lunch'
  | 'is_eating_out_dinner'

const EATING_OUT_KEY: Record<MealSlot, EatingOutKey> = {
  breakfast: 'is_eating_out_breakfast',
  lunch: 'is_eating_out_lunch',
  dinner: 'is_eating_out_dinner',
}

interface Props {
  weekStartDate: string
  initialPlan: DbMealPlan | null
  recipes: DbRecipe[]
  initialPersonaId: PersonaId
  targetCalories: number
  targetPfc: { protein: number; fat: number; carbs: number }
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
  targetCalories,
  targetPfc,
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [plan, setPlan] = useState<DbMealPlan | null>(initialPlan)
  const [personaId, setPersonaId] = useState<PersonaId>(initialPersonaId)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])

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

  async function toggleEatingOut(dayIdx: number, slot: MealSlot) {
    if (!plan) {
      setToast('まず献立を生成してください')
      return
    }
    setError(null)

    const key = EATING_OUT_KEY[slot]
    const prevPlan = plan
    const newWeek: WeekPlan = { ...plan.plan }
    const day: DayMeals = { ...(newWeek[dayIdx] ?? emptyDay()) }
    day[key] = !day[key]
    newWeek[dayIdx] = day

    const newPlan: DbMealPlan = { ...plan, plan: newWeek }
    setPlan(newPlan)

    const { error: updErr } = await supabase
      .from('meal_plans')
      .update({ plan: newWeek })
      .eq('id', plan.id)

    if (updErr) {
      setError(updErr.message)
      setPlan(prevPlan)
      setToast('変更を保存できませんでした')
      return
    }

    setToast(
      `${DAY_LABELS[dayIdx]}曜${SLOT_LABEL[slot]}を${day[key] ? '外食' : '手作り'}に変更しました`,
    )
    router.refresh()
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

      {plan && (
        <NutritionChart
          week={week}
          recipeMap={recipeMap}
          targetCalories={targetCalories}
          targetPfc={targetPfc}
        />
      )}

      <p className="text-xs text-muted text-center -mb-1">
        カードを<span className="font-bold">長押し</span>で外食 / 手作りを切替
      </p>

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
                      onToggleEatingOut={() => toggleEatingOut(dayIdx, slot)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {toast && (
        <div
          className="fixed left-1/2 bottom-20 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-full text-sm shadow-lg z-50"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
