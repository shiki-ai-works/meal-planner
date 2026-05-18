'use client'

import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_EMOJI, CATEGORY_ORDER, type ShoppingItem } from '@/lib/shopping-list'
import type { Ingredient } from '@/types/database'

const STORAGE_PREFIX = 'meal-planner:basket:'

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

export function ShoppingClient({ weekStartDate, grouped }: Props) {
  const flat = useMemo(() => {
    const list: ShoppingItem[] = []
    for (const cat of CATEGORY_ORDER) for (const it of grouped[cat]) list.push(it)
    return list
  }, [grouped])

  const storageKey = `${STORAGE_PREFIX}${weekStartDate}`
  const [inBasket, setInBasket] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setInBasket(new Set(arr.filter((x) => typeof x === 'string')))
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [storageKey])

  // 消費完了したキーは自動で外す（取り消し線が外れたら永続化対象から除外）
  useEffect(() => {
    if (!hydrated) return
    setInBasket((prev) => {
      let changed = false
      const next = new Set(prev)
      for (const it of flat) {
        if (it.consumed >= it.amount && it.amount > 0) {
          const k = itemKey(it)
          if (next.has(k)) {
            next.delete(k)
            changed = true
          }
        }
      }
      return changed ? next : prev
    })
  }, [flat, hydrated])

  // 変更を保存
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(storageKey, JSON.stringify([...inBasket]))
    } catch {
      // ignore (容量超過等)
    }
  }, [inBasket, hydrated, storageKey])

  function toggleBasket(k: string) {
    setInBasket((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const total = flat.length
  const done = flat.filter((it) => it.consumed >= it.amount && it.amount > 0).length
  const basketCount = flat.filter((it) => inBasket.has(itemKey(it))).length

  if (total === 0) {
    return (
      <p className="text-sm text-muted text-center py-6">
        買い物リストは空です。献立を生成してください。
      </p>
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inB}
                        onChange={() => toggleBasket(k)}
                        className="accent-accent"
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
