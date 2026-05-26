'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { CATEGORY_EMOJI, CATEGORY_ORDER, type ShoppingItem } from '@/lib/shopping-list'
import type { Ingredient } from '@/types/database'

const STORAGE_PREFIX = 'meal-planner:basket:'
const BASKET_CHANGE_EVENT = 'meal-planner:basket-change'

interface Props {
  weekStartDate: string
  grouped: Record<Ingredient['category'], ShoppingItem[]>
}

function fmt(n: number) {
  return Math.round(n * 10) / 10
}

function itemKey(it: ShoppingItem) {
  return `${it.ingredient_name}__${it.unit}`
}

function readBasketSnapshot(storageKey: string) {
  if (typeof window === 'undefined') return '[]'
  return localStorage.getItem(storageKey) ?? '[]'
}

function parseBasketSnapshot(snapshot: string) {
  try {
    const arr = JSON.parse(snapshot)
    if (!Array.isArray(arr)) return new Set<string>()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set<string>()
  }
}

function saveBasketSnapshot(storageKey: string, values: Set<string>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...values]))
    window.dispatchEvent(new CustomEvent<string>(BASKET_CHANGE_EVENT, { detail: storageKey }))
  } catch {
    // ignore (容量超過等)
  }
}

export function ShoppingClient({ weekStartDate, grouped }: Props) {
  const flat = useMemo(() => {
    const list: ShoppingItem[] = []
    for (const cat of CATEGORY_ORDER) for (const it of grouped[cat]) list.push(it)
    return list
  }, [grouped])

  const storageKey = `${STORAGE_PREFIX}${weekStartDate}`
  const subscribeBasket = useCallback(
    (onStoreChange: () => void) => {
      function onStorage(event: StorageEvent) {
        if (event.key === storageKey) onStoreChange()
      }

      function onLocalChange(event: Event) {
        if ((event as CustomEvent<string>).detail === storageKey) onStoreChange()
      }

      window.addEventListener('storage', onStorage)
      window.addEventListener(BASKET_CHANGE_EVENT, onLocalChange)
      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(BASKET_CHANGE_EVENT, onLocalChange)
      }
    },
    [storageKey],
  )

  const basketSnapshot = useSyncExternalStore(
    subscribeBasket,
    () => readBasketSnapshot(storageKey),
    () => '[]',
  )
  const inBasket = useMemo(() => parseBasketSnapshot(basketSnapshot), [basketSnapshot])

  // 消費完了したキーは自動で外す（取り消し線が外れたら永続化対象から除外）
  useEffect(() => {
    let changed = false
    const next = new Set(inBasket)
    for (const it of flat) {
      if (it.consumed >= it.amount && it.amount > 0) {
        const k = itemKey(it)
        if (next.has(k)) {
          next.delete(k)
          changed = true
        }
      }
    }
    if (changed) saveBasketSnapshot(storageKey, next)
  }, [flat, inBasket, storageKey])

  function toggleBasket(k: string) {
    const next = new Set(inBasket)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    saveBasketSnapshot(storageKey, next)
  }

  const total = flat.length
  const done = flat.filter((it) => it.consumed >= it.amount && it.amount > 0).length
  const basketCount = flat.filter((it) => inBasket.has(itemKey(it))).length

  if (total === 0) {
    return (
      <div className="hud-border bg-card p-5 text-center">
        <p className="text-sm font-bold">買い足す食材はありません</p>
        <p className="mt-2 text-xs text-muted">
          常備品や在庫で足りているか、外食枠だけの週になっています。
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="hud-border bg-card p-3 flex items-baseline justify-between">
        <div className="text-xs text-muted">
          週開始 <span className="font-mono text-foreground">{weekStartDate}</span>
        </div>
        <div className="text-xs flex gap-3">
          <span>
            <span className="text-muted">カゴ </span>
            <span className="font-mono text-foreground">{basketCount}</span>
            <span className="text-muted"> / {total}</span>
          </span>
          <span>
            <span className="text-muted">消費 </span>
            <span className="font-mono text-foreground">{done}</span>
            <span className="text-muted"> / {total}</span>
          </span>
        </div>
      </div>
      <p className="text-[10px] text-muted -mt-2">
        ※ 数値は献立から自動集計（消費量は朝9時/昼14時/夜21時で完了とみなす）
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat]
        if (items.length === 0) return null
        return (
          <section key={cat} className="hud-border bg-card p-3">
            <h2 className="text-sm font-bold mb-2">
              {CATEGORY_EMOJI[cat]} {cat}
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((it) => {
                const k = itemKey(it)
                const isDone = it.consumed >= it.amount && it.amount > 0
                const inB = inBasket.has(k)
                const ratio =
                  it.amount > 0 ? Math.min(100, (it.consumed / it.amount) * 100) : 0
                return (
                  <li key={k} className="flex flex-col gap-1">
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded border border-transparent px-1 py-1 hover:border-card-border">
                      <input
                        type="checkbox"
                        checked={inB}
                        onChange={() => toggleBasket(k)}
                        className="h-5 w-5 shrink-0 accent-accent"
                        aria-label="カゴに入れる"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          isDone
                            ? ''
                            : inB
                              ? 'text-muted line-through'
                              : 'line-through text-muted'
                        }`}
                      >
                        {it.ingredient_name}
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          isDone ? 'text-success' : 'text-muted'
                        }`}
                      >
                        {fmt(it.consumed)}/{fmt(it.amount)}
                        {it.unit}
                      </span>
                    </label>
                    <div className="h-1 w-full bg-card-border rounded overflow-hidden">
                      <div
                        className={isDone ? 'bg-success h-full' : 'bg-accent h-full'}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
