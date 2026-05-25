'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type PointerEvent,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DAY_LABELS, MEAL_SLOT_LABEL, emptyDay, emptyWeek, type MealSlot } from '@/lib/week-plan'
import type { DayMeals, DbMealPlan, DbRecipe, MealType, WeekPlan } from '@/types/database'

interface Props {
  recipeId: string
  recipeName: string
  preferredMealType: MealType
  weekStartDate: string
  initialPlan: DbMealPlan | null
  recipes: DbRecipe[]
}

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const DAY_MS = 24 * 60 * 60 * 1000

type LockedKey = 'breakfast_locked' | 'lunch_locked' | 'dinner_locked'
type EatingOutKey = 'is_eating_out_breakfast' | 'is_eating_out_lunch' | 'is_eating_out_dinner'

const LOCKED_KEY: Record<MealSlot, LockedKey> = {
  breakfast: 'breakfast_locked',
  lunch: 'lunch_locked',
  dinner: 'dinner_locked',
}

const EATING_OUT_KEY: Record<MealSlot, EatingOutKey> = {
  breakfast: 'is_eating_out_breakfast',
  lunch: 'is_eating_out_lunch',
  dinner: 'is_eating_out_dinner',
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getCurrentDayIndex(weekStartDate: string) {
  const weekStart = parseLocalDate(weekStartDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.floor((today.getTime() - weekStart.getTime()) / DAY_MS)
  return diff >= 0 && diff <= 6 ? diff : 0
}

function clearSlot(day: DayMeals, slot: MealSlot) {
  if (slot === 'breakfast') {
    day.breakfast = null
  } else if (slot === 'lunch') {
    day.lunch = null
  } else {
    day.dinner = null
  }
  day[LOCKED_KEY[slot]] = false
  day[EATING_OUT_KEY[slot]] = false
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

export function RecipeAssignPanel({
  recipeId,
  recipeName,
  weekStartDate,
  initialPlan,
  recipes,
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [plan, setPlan] = useState<DbMealPlan | null>(initialPlan)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [savingSlot, setSavingSlot] = useState<string | null>(null)
  const [draggedSlot, setDraggedSlot] = useState<{
    dayIdx: number
    slot: MealSlot
    title: string
  } | null>(null)
  const menuListRef = useRef<HTMLDivElement | null>(null)
  const removeZoneRef = useRef<HTMLDivElement | null>(null)
  const pointerDragRef = useRef<{
    dayIdx: number
    slot: MealSlot
    title: string
    startX: number
    startY: number
    active: boolean
  } | null>(null)
  const skipSlotClickRef = useRef(false)
  const week: WeekPlan = plan?.plan ?? emptyWeek()
  const currentDayIndex = useMemo(() => getCurrentDayIndex(weekStartDate), [weekStartDate])
  const recipeMap = useMemo(() => {
    const m = new Map<string, DbRecipe>()
    for (const recipe of recipes) m.set(recipe.id, recipe)
    return m
  }, [recipes])

  useEffect(() => {
    const list = menuListRef.current
    const currentDay = list?.querySelector<HTMLElement>(`[data-day-index="${currentDayIndex}"]`)
    if (!list || !currentDay) return

    const listRect = list.getBoundingClientRect()
    const dayRect = currentDay.getBoundingClientRect()
    list.scrollTop += dayRect.top - listRect.top - 8
  }, [currentDayIndex, weekStartDate])

  async function saveCurrentWeek(nextWeek: WeekPlan, successMessage: string, actionId: string) {
    if (!plan) {
      setMessage(null)
      setError('まず献立を作るか、この料理をどこかの枠に入れてください')
      return
    }

    setMessage(null)
    setError(null)
    setSavingSlot(actionId)

    const prevPlan = plan
    const nextPlan: DbMealPlan = { ...plan, plan: nextWeek }
    setPlan(nextPlan)

    const { error: updateError } = await supabase
      .from('meal_plans')
      .update({ plan: nextWeek })
      .eq('id', plan.id)

    if (updateError) {
      setPlan(prevPlan)
      setError(updateError.message)
      setSavingSlot(null)
      return
    }

    setMessage(successMessage)
    setSavingSlot(null)
    router.refresh()
  }

  function assignTo(dayOfWeek: number, mealType: MealSlot) {
    setMessage(null)
    setError(null)
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
            lockScope: 'week',
          }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        setPlan(body.mealPlan as DbMealPlan)
        setMessage(
          `${DAY_LABELS[dayOfWeek]}曜${MEAL_SLOT_LABEL[mealType]}を「${recipeName}」に差し替えました`
        )
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : '保存に失敗しました')
      }
    })
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData('text/plain', recipeId)
    event.dataTransfer.effectAllowed = 'copy'
  }

  function scrollMenuListNear(y: number) {
    const list = menuListRef.current
    if (!list) return

    const rect = list.getBoundingClientRect()
    const edge = 56

    if (y < rect.top + edge) {
      list.scrollTop -= Math.ceil((rect.top + edge - y) / 2)
    } else if (y > rect.bottom - edge) {
      list.scrollTop += Math.ceil((y - (rect.bottom - edge)) / 2)
    }
  }

  function handleMenuListDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = draggedSlot ? 'move' : 'copy'
    scrollMenuListNear(event.clientY)
  }

  function toggleLocked(dayIdx: number, slot: MealSlot) {
    if (!plan) {
      setMessage(null)
      setError('まず献立を作るか、この料理をどこかの枠に入れてください')
      return
    }

    const key = LOCKED_KEY[slot]
    const newWeek: WeekPlan = { ...plan.plan }
    const day: DayMeals = { ...(newWeek[dayIdx] ?? emptyDay()) }
    day[key] = !day[key]
    newWeek[dayIdx] = day

    void saveCurrentWeek(
      newWeek,
      `${DAY_LABELS[dayIdx]}曜${MEAL_SLOT_LABEL[slot]}を${day[key] ? '固定' : '固定解除'}しました`,
      `lock:${dayIdx}:${slot}`
    )
  }

  function removeFromSlot(dayIdx: number, slot: MealSlot) {
    if (!plan) {
      setMessage(null)
      setError('外せる献立がまだありません')
      return
    }

    const newWeek: WeekPlan = { ...plan.plan }
    const day: DayMeals = { ...(newWeek[dayIdx] ?? emptyDay()) }
    const fields = getSlotFields(day, slot)
    if (!fields.recipeId && !fields.eatingOut) {
      setMessage(null)
      setError('この枠はもう空です')
      return
    }

    clearSlot(day, slot)
    newWeek[dayIdx] = day

    void saveCurrentWeek(
      newWeek,
      `${DAY_LABELS[dayIdx]}曜${MEAL_SLOT_LABEL[slot]}を献立から外しました`,
      `remove:${dayIdx}:${slot}`
    )
  }

  function handleSlotPointerDown(
    event: PointerEvent<HTMLDivElement>,
    dayIdx: number,
    slot: MealSlot,
    title: string,
    canDragOut: boolean
  ) {
    if (!canDragOut || event.button !== 0) return
    pointerDragRef.current = {
      dayIdx,
      slot,
      title,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp, { once: true })
    window.addEventListener('pointercancel', handleWindowPointerCancel, {
      once: true,
    })
  }

  function stopPointerListeners() {
    window.removeEventListener('pointermove', handleWindowPointerMove)
    window.removeEventListener('pointerup', handleWindowPointerUp)
    window.removeEventListener('pointercancel', handleWindowPointerCancel)
  }

  function updatePointerDrag(clientX: number, clientY: number) {
    const drag = pointerDragRef.current
    if (!drag) return

    const dx = clientX - drag.startX
    const dy = clientY - drag.startY
    if (!drag.active && Math.hypot(dx, dy) > 8) {
      drag.active = true
      skipSlotClickRef.current = true
      setDraggedSlot({
        dayIdx: drag.dayIdx,
        slot: drag.slot,
        title: drag.title,
      })
    }

    if (drag.active) {
      scrollMenuListNear(clientY)
    }
  }

  function finishPointerDrag(clientX: number, clientY: number) {
    const drag = pointerDragRef.current
    pointerDragRef.current = null
    if (!drag) return

    if (!drag.active) {
      setDraggedSlot(null)
      return
    }

    const zone = removeZoneRef.current?.getBoundingClientRect()
    setDraggedSlot(null)
    if (
      zone &&
      clientX >= zone.left &&
      clientX <= zone.right &&
      clientY >= zone.top &&
      clientY <= zone.bottom
    ) {
      removeFromSlot(drag.dayIdx, drag.slot)
    }
  }

  function handleSlotPointerMove(event: PointerEvent<HTMLDivElement>) {
    updatePointerDrag(event.clientX, event.clientY)
    if (pointerDragRef.current?.active) event.preventDefault()
  }

  function handleSlotPointerUp(event: PointerEvent<HTMLDivElement>) {
    stopPointerListeners()
    event.preventDefault()
    finishPointerDrag(event.clientX, event.clientY)
  }

  function handleSlotPointerCancel() {
    stopPointerListeners()
    pointerDragRef.current = null
    setDraggedSlot(null)
  }

  function handleWindowPointerMove(event: globalThis.PointerEvent) {
    updatePointerDrag(event.clientX, event.clientY)
  }

  function handleWindowPointerUp(event: globalThis.PointerEvent) {
    stopPointerListeners()
    finishPointerDrag(event.clientX, event.clientY)
  }

  function handleWindowPointerCancel() {
    stopPointerListeners()
    pointerDragRef.current = null
    setDraggedSlot(null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, dayIdx: number, slot: MealSlot) {
    event.preventDefault()
    if (event.dataTransfer.getData('text/plain') !== recipeId) return
    assignTo(dayIdx, slot)
  }

  function handleRemoveDragOver(event: DragEvent<HTMLDivElement>) {
    if (!draggedSlot) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleRemoveDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const raw = event.dataTransfer.getData('application/x-meal-slot')
    setDraggedSlot(null)
    if (!raw) return

    try {
      const data = JSON.parse(raw) as { dayIdx?: number; slot?: MealSlot }
      if (
        typeof data.dayIdx === 'number' &&
        data.dayIdx >= 0 &&
        data.dayIdx <= 6 &&
        data.slot &&
        SLOTS.includes(data.slot)
      ) {
        removeFromSlot(data.dayIdx, data.slot)
      }
    } catch {
      setError('外す枠を読み取れませんでした')
    }
  }

  return (
    <section className="hud-border bg-card p-3 flex flex-col gap-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">現在の一週間のメニュー一覧</h2>
          <p className="mt-1 text-[10px] text-muted">
            枠をタップすると「{recipeName}」に差し替えます。
          </p>
        </div>
        <Link href="/dashboard" className="text-[10px] text-muted hover:text-accent">
          献立へ
        </Link>
      </div>

      <div
        draggable
        onDragStart={handleDragStart}
        className="hidden cursor-grab rounded border border-accent bg-accent/10 px-3 py-2 text-xs text-foreground active:cursor-grabbing sm:block"
        title="この料理を下の枠へドラッグして差し替え"
      >
        つかんで入れる: <span className="font-bold">{recipeName}</span>
      </div>

      <div
        ref={removeZoneRef}
        onDragOver={handleRemoveDragOver}
        onDrop={handleRemoveDrop}
        className={`rounded border border-dashed px-3 py-2 text-xs transition ${
          draggedSlot
            ? 'border-danger bg-danger/10 text-danger'
            : 'border-card-border bg-background/25 text-muted'
        }`}
      >
        つかんで外す:{' '}
        <span className="font-bold">
          {draggedSlot
            ? `${DAY_LABELS[draggedSlot.dayIdx]}曜${MEAL_SLOT_LABEL[draggedSlot.slot]}の「${draggedSlot.title}」をここへ`
            : '外したいメニュー枠をここへドラッグ'}
        </span>
      </div>

      <div
        ref={menuListRef}
        onDragOver={handleMenuListDragOver}
        className="max-h-[292px] overflow-y-auto overscroll-contain rounded border border-card-border/50 bg-background/20 p-2 pr-3"
      >
        <div className="grid gap-3">
          {DAY_LABELS.map((label, dayIdx) => {
            const day = week[dayIdx] ?? emptyDay()
            return (
              <div key={label} className="grid gap-1" data-day-index={dayIdx}>
                <div className="text-[10px] font-bold text-muted">{label}曜日</div>
                <div className="grid grid-cols-3 gap-1">
                  {SLOTS.map((slot) => {
                    const fields = getSlotFields(day, slot)
                    const currentRecipe = fields.recipeId ? recipeMap.get(fields.recipeId) : null
                    const isCurrentRecipe = fields.recipeId === recipeId
                    const slotTitle = fields.eatingOut ? '外食' : (currentRecipe?.name ?? '未定')
                    const canDragOut = Boolean(fields.recipeId || fields.eatingOut)
                    const actionId = `${dayIdx}:${slot}`
                    const isSavingSlot =
                      savingSlot === `lock:${actionId}` || savingSlot === `remove:${actionId}`
                    const slotDisabled = isPending || isSavingSlot
                    return (
                      <div
                        key={slot}
                        className={`relative rounded border text-left transition ${
                          isCurrentRecipe
                            ? 'border-accent bg-accent text-white'
                            : 'border-card-border bg-background/55 hover:border-accent hover:bg-accent/10'
                        } ${isSavingSlot ? 'opacity-60' : ''}`}
                      >
                        <div
                          role="button"
                          tabIndex={slotDisabled ? -1 : 0}
                          aria-disabled={slotDisabled}
                          onClick={() => {
                            if (skipSlotClickRef.current) {
                              skipSlotClickRef.current = false
                              return
                            }
                            if (!slotDisabled) assignTo(dayIdx, slot)
                          }}
                          onKeyDown={(event) => {
                            if (slotDisabled) return
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              assignTo(dayIdx, slot)
                            }
                          }}
                          onPointerDown={(event) =>
                            handleSlotPointerDown(
                              event,
                              dayIdx,
                              slot,
                              slotTitle,
                              canDragOut && !slotDisabled
                            )
                          }
                          onPointerMove={handleSlotPointerMove}
                          onPointerUp={handleSlotPointerUp}
                          onPointerCancel={handleSlotPointerCancel}
                          onDragOver={(event) => {
                            event.preventDefault()
                            event.dataTransfer.dropEffect = 'copy'
                          }}
                          onDrop={(event) => handleDrop(event, dayIdx, slot)}
                          className={`min-h-[64px] rounded px-2 py-1 pr-8 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${
                            slotDisabled ? 'opacity-60' : ''
                          } ${canDragOut ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`block text-[10px] ${
                              isCurrentRecipe ? 'text-white/85' : 'text-muted'
                            }`}
                          >
                            {MEAL_SLOT_LABEL[slot]}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-xs font-bold leading-snug">
                            {slotTitle}
                          </span>
                          <span
                            className={`mt-1 block text-[10px] ${
                              isCurrentRecipe ? 'text-white/80' : 'text-muted'
                            }`}
                          >
                            {isCurrentRecipe
                              ? '選択中'
                              : canDragOut
                                ? 'タップで差し替え / ドラッグで外す'
                                : 'タップで差し替え'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleLocked(dayIdx, slot)
                          }}
                          disabled={!plan || isSavingSlot}
                          aria-label={`${DAY_LABELS[dayIdx]}曜${MEAL_SLOT_LABEL[slot]}を${fields.locked ? '固定解除' : '固定'}`}
                          title={fields.locked ? '固定を外す' : '固定する'}
                          className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded border text-[11px] shadow-sm transition disabled:opacity-50 ${
                            isCurrentRecipe
                              ? 'border-white/50 bg-white/15 text-white hover:bg-white/25'
                              : 'border-card-border bg-card text-accent hover:border-accent'
                          }`}
                        >
                          {fields.locked ? '🔒' : '🔓'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {message && <p className="text-xs text-success">{message}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </section>
  )
}
