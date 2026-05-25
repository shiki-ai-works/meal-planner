'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DAY_LABELS, MEAL_SLOT_LABEL, type MealSlot } from '@/lib/week-plan'
import type { DbLockedMeal, DbRecipe, MealType } from '@/types/database'

interface Props {
  initialLocks: DbLockedMeal[]
  recipes: Pick<DbRecipe, 'id' | 'name'>[]
}

const SLOT_ORDER: Record<MealSlot, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
}

const EATING_OUT_VALUE = '__eating_out__'

interface LockDraft {
  dayOfWeek: number
  mealType: MealSlot
  value: string
}

function isMealSlot(mealType: MealType): mealType is MealSlot {
  return mealType !== 'any'
}

function normalizeMealSlot(mealType: MealType): MealSlot {
  return isMealSlot(mealType) ? mealType : 'dinner'
}

function sortLocks(a: DbLockedMeal, b: DbLockedMeal) {
  const dayDiff = a.day_of_week - b.day_of_week
  if (dayDiff !== 0) return dayDiff
  if (!isMealSlot(a.meal_type) || !isMealSlot(b.meal_type)) return 0
  return SLOT_ORDER[a.meal_type] - SLOT_ORDER[b.meal_type]
}

function getDraftValue(lock: DbLockedMeal) {
  if (lock.is_eating_out) return EATING_OUT_VALUE
  return lock.recipe_id ?? ''
}

function getDraft(lock: DbLockedMeal): LockDraft {
  return {
    dayOfWeek: lock.day_of_week,
    mealType: normalizeMealSlot(lock.meal_type),
    value: getDraftValue(lock),
  }
}

function isDraftDirty(lock: DbLockedMeal, draft: LockDraft) {
  return (
    draft.dayOfWeek !== lock.day_of_week ||
    draft.mealType !== normalizeMealSlot(lock.meal_type) ||
    draft.value !== getDraftValue(lock)
  )
}

export function WeeklyLocksClient({ initialLocks, recipes }: Props) {
  const router = useRouter()
  const [locks, setLocks] = useState(() => [...initialLocks].sort(sortLocks))
  const [drafts, setDrafts] = useState<Record<string, LockDraft>>(() =>
    Object.fromEntries(initialLocks.map((lock) => [lock.id, getDraft(lock)])),
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const recipeMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const recipe of recipes) map.set(recipe.id, recipe.name)
    return map
  }, [recipes])

  function updateDraft(lockId: string, patch: Partial<LockDraft>) {
    setDrafts((current) => {
      const lock = locks.find((item) => item.id === lockId)
      if (!lock) return current
      return {
        ...current,
        [lockId]: {
          ...(current[lockId] ?? getDraft(lock)),
          ...patch,
        },
      }
    })
  }

  function removeLock(lockId: string) {
    setError(null)
    setMessage(null)
    setDeletingId(lockId)
    const prevLocks = locks
    setLocks((current) => current.filter((lock) => lock.id !== lockId))

    startTransition(async () => {
      const res = await fetch(`/api/weekly-locks/${lockId}`, {
        method: 'DELETE',
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setLocks(prevLocks)
        setError(body.error ?? `HTTP ${res.status}`)
        setDeletingId(null)
        return
      }

      setMessage('毎週固定を解除しました')
      setDeletingId(null)
      router.refresh()
    })
  }

  function saveLock(lock: DbLockedMeal) {
    const draft = drafts[lock.id] ?? getDraft(lock)
    if (!draft.value) {
      setError('レシピを選ぶか、外食固定にしてください')
      return
    }
    const hasSlotConflict = locks.some(
      (item) =>
        item.id !== lock.id &&
        item.day_of_week === draft.dayOfWeek &&
        normalizeMealSlot(item.meal_type) === draft.mealType,
    )
    if (hasSlotConflict) {
      setError('その曜日と食事枠には、すでに毎週固定があります')
      return
    }

    setError(null)
    setMessage(null)
    setSavingId(lock.id)
    startTransition(async () => {
      const res = await fetch(`/api/weekly-locks/${lock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: draft.dayOfWeek,
          mealType: draft.mealType,
          recipeId: draft.value === EATING_OUT_VALUE ? null : draft.value,
          isEatingOut: draft.value === EATING_OUT_VALUE,
        }),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(body.error ?? `HTTP ${res.status}`)
        setSavingId(null)
        return
      }

      const nextLock = body.lock as DbLockedMeal
      setLocks((current) =>
        current.map((item) => (item.id === nextLock.id ? nextLock : item)).sort(sortLocks),
      )
      setDrafts((current) => ({
        ...current,
        [nextLock.id]: getDraft(nextLock),
      }))
      setMessage('毎週固定を更新しました')
      setSavingId(null)
      router.refresh()
    })
  }

  return (
    <section className="hud-border bg-card p-3">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold">毎週固定</h2>
        <span className="font-mono text-xs text-muted">{locks.length} 件</span>
      </div>

      {locks.length === 0 ? (
        <p className="text-xs text-muted">まだ毎週固定はありません</p>
      ) : (
        <div className="flex flex-col gap-2">
          {locks.map((lock) => {
            const slotLabel = isMealSlot(lock.meal_type)
              ? MEAL_SLOT_LABEL[lock.meal_type]
              : '食事'
            const recipeName = lock.recipe_id
              ? recipeMap.get(lock.recipe_id) ?? '未登録レシピ'
              : lock.is_eating_out
                ? '外食'
                : '未定'
            const draft = drafts[lock.id] ?? getDraft(lock)
            const isDirty = isDraftDirty(lock, draft)
            const isBusy = isPending && (deletingId === lock.id || savingId === lock.id)
            const recipeMissing =
              lock.recipe_id && !recipeMap.has(lock.recipe_id) ? lock.recipe_id : null
            const hasSlotConflict = locks.some(
              (item) =>
                item.id !== lock.id &&
                item.day_of_week === draft.dayOfWeek &&
                normalizeMealSlot(item.meal_type) === draft.mealType,
            )

            return (
              <div
                key={lock.id}
                className="flex flex-col gap-2 rounded border border-card-border bg-background/45 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold">
                      {DAY_LABELS[lock.day_of_week]}曜 {slotLabel}
                    </div>
                    <div className="truncate text-xs text-muted">{recipeName}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLock(lock.id)}
                    disabled={isBusy}
                    className="shrink-0 rounded border border-card-border px-3 py-1 text-xs text-muted hover:border-danger hover:text-danger disabled:opacity-50"
                  >
                    {isPending && deletingId === lock.id ? '解除中…' : '解除'}
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1.6fr)_auto]">
                  <label className="min-w-0">
                    <span className="mb-1 block text-[10px] text-muted">曜日</span>
                    <select
                      value={draft.dayOfWeek}
                      onChange={(event) =>
                        updateDraft(lock.id, {
                          dayOfWeek: Number(event.target.value),
                        })
                      }
                      disabled={isBusy}
                      className="w-full rounded border border-card-border bg-white px-2 py-1 text-xs"
                    >
                      {DAY_LABELS.map((label, idx) => (
                        <option key={label} value={idx}>
                          {label}曜
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="min-w-0">
                    <span className="mb-1 block text-[10px] text-muted">食事</span>
                    <select
                      value={draft.mealType}
                      onChange={(event) =>
                        updateDraft(lock.id, {
                          mealType: event.target.value as MealSlot,
                        })
                      }
                      disabled={isBusy}
                      className="w-full rounded border border-card-border bg-white px-2 py-1 text-xs"
                    >
                      {Object.entries(MEAL_SLOT_LABEL).map(([slot, label]) => (
                        <option key={slot} value={slot}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="min-w-0">
                    <span className="mb-1 block text-[10px] text-muted">内容</span>
                    <select
                      value={draft.value}
                      onChange={(event) =>
                        updateDraft(lock.id, { value: event.target.value })
                      }
                      disabled={isBusy}
                      className="w-full rounded border border-card-border bg-white px-2 py-1 text-xs"
                    >
                      <option value={EATING_OUT_VALUE}>外食固定</option>
                      {recipeMissing && (
                        <option value={recipeMissing}>未登録レシピ</option>
                      )}
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => saveLock(lock)}
                    disabled={isBusy || !isDirty || hasSlotConflict}
                    className="self-end rounded bg-accent px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {isPending && savingId === lock.id ? '更新中…' : '更新'}
                  </button>
                </div>
                {hasSlotConflict && (
                  <p className="text-[10px] text-danger">
                    この枠には別の毎週固定があります
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {message && <p className="mt-2 text-xs text-success">{message}</p>}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </section>
  )
}
