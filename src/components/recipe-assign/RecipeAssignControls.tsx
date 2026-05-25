'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  DAY_LABELS,
  MEAL_SLOT_LABEL,
  getMondayISO,
  type MealSlot,
} from '@/lib/week-plan'
import type { MealType } from '@/types/database'

interface Props {
  recipeId: string
  recipeName: string
  preferredMealType: MealType
  onAssigned?: (message: string) => void
}

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

type LockScope = 'none' | 'week' | 'weekly'

const LOCK_SCOPE_OPTIONS: { value: LockScope; label: string }[] = [
  { value: 'none', label: '自由' },
  { value: 'week', label: '今週固定' },
  { value: 'weekly', label: '毎週固定' },
]

const LOCK_SCOPE_MESSAGE: Record<LockScope, string> = {
  none: '固定せずに',
  week: '今週だけ固定で',
  weekly: '毎週固定で',
}

function currentJapaneseDayIndex() {
  return (new Date().getDay() + 6) % 7
}

function defaultSlot(mealType: MealType): MealSlot {
  return mealType === 'any' ? 'dinner' : mealType
}

export function RecipeAssignControls({
  recipeId,
  recipeName,
  preferredMealType,
  onAssigned,
}: Props) {
  const weekStartDate = useMemo(() => getMondayISO(new Date()), [])
  const [dayOfWeek, setDayOfWeek] = useState(currentJapaneseDayIndex)
  const [mealType, setMealType] = useState<MealSlot>(defaultSlot(preferredMealType))
  const [lockScope, setLockScope] = useState<LockScope>('week')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function assign() {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/assign-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId,
            weekStartDate,
            dayOfWeek,
            mealType,
            lockScope,
          }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const nextMessage = `${DAY_LABELS[dayOfWeek]}曜${MEAL_SLOT_LABEL[mealType]}に${LOCK_SCOPE_MESSAGE[lockScope]}入れました`
        setMessage(nextMessage)
        onAssigned?.(nextMessage)
      } catch (e) {
        setError(e instanceof Error ? e.message : '保存に失敗しました')
      }
    })
  }

  return (
    <div>
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[10px] text-muted">曜日</div>
            <div className="grid grid-cols-7 gap-1">
              {DAY_LABELS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDayOfWeek(idx)}
                  className={`h-9 rounded border text-xs ${
                    dayOfWeek === idx
                      ? 'border-accent bg-accent text-white'
                      : 'border-card-border bg-white text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] text-muted">食事</div>
            <div className="grid grid-cols-3 gap-1">
              {SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setMealType(slot)}
                  className={`h-9 rounded border text-xs ${
                    mealType === slot
                      ? 'border-accent bg-accent text-white'
                      : 'border-card-border bg-white text-muted'
                  }`}
                >
                  {MEAL_SLOT_LABEL[slot]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1 text-[10px] text-muted">固定</div>
          <div className="grid grid-cols-3 gap-1">
            {LOCK_SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLockScope(option.value)}
                className={`h-9 rounded border text-xs ${
                  lockScope === option.value
                    ? 'border-accent bg-accent text-white'
                    : 'border-card-border bg-white text-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={assign}
        disabled={isPending}
        className="mt-3 w-full rounded bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {isPending ? '保存中…' : '献立に入れる'}
      </button>

      {message && (
        <p className="mt-2 text-xs text-success">{recipeName} を{message}</p>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  )
}
