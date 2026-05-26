'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DbInventory } from '@/types/database'

interface Props {
  initialItems: DbInventory[]
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function expiryBadge(days: number | null) {
  if (days === null) return { label: '—', className: 'text-muted' }
  if (days < 0)
    return { label: `${-days}日経過`, className: 'text-danger font-bold' }
  if (days === 0) return { label: '今日', className: 'text-danger font-bold' }
  if (days <= 3) return { label: `あと${days}日`, className: 'text-warning' }
  return { label: `あと${days}日`, className: 'text-muted' }
}

export function InventoryClient({ initialItems }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [items, setItems] = useState<DbInventory[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('')
  const [expiry, setExpiry] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('ログインが必要です')
      return
    }

    startTransition(async () => {
      const { data, error: insErr } = await supabase
        .from('inventory')
        .insert({
          user_id: user.id,
          ingredient_name: name.trim(),
          amount: amount === '' ? null : Number(amount),
          unit: unit.trim() || null,
          expiry_date: expiry || null,
        })
        .select()
        .single()

      if (insErr || !data) {
        setError(insErr?.message ?? '追加に失敗しました')
        return
      }
      setItems((prev) => [data as DbInventory, ...prev])
      setName('')
      setAmount('')
      setUnit('')
      setExpiry('')
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    setError(null)
    const prev = items
    setItems((p) => p.filter((it) => it.id !== id))
    const { error: delErr } = await supabase.from('inventory').delete().eq('id', id)
    if (delErr) {
      setError(delErr.message)
      setItems(prev)
      return
    }
    router.refresh()
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = daysUntil(a.expiry_date)
      const db = daysUntil(b.expiry_date)
      if (da === null && db === null) return 0
      if (da === null) return 1
      if (db === null) return -1
      return da - db
    })
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleAdd}
        className="hud-border bg-card p-3 flex flex-col gap-2"
      >
        <div className="text-xs text-muted">食材を追加</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="食材名（例: 鶏もも肉）"
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="数量"
            className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
          />
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="単位（g, 個…）"
            className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
          />
        </div>
        <label className="text-xs text-muted flex items-center gap-2">
          賞味期限
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="flex-1 bg-transparent border border-card-border rounded px-2 py-1 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? '追加中…' : '追加'}
        </button>
      </form>

      {error && (
        <div className="hud-border bg-card p-3" role="alert">
          <p className="text-sm font-bold text-danger">在庫を更新できませんでした</p>
          <p className="mt-1 text-xs text-muted">{error}</p>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="hud-border bg-card p-5 text-center">
          <p className="text-sm font-bold">在庫はまだありません</p>
          <p className="mt-2 text-xs text-muted">
            よく使う食材を入れておくと、買い物リストが余分な買い足しを避けやすくなります。
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((it) => {
            const days = daysUntil(it.expiry_date)
            const badge = expiryBadge(days)
            return (
              <li
                key={it.id}
                className="hud-border bg-card p-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">
                    {it.ingredient_name}
                  </div>
                  <div className="text-xs text-muted">
                    {it.amount !== null ? `${it.amount}${it.unit ?? ''}` : '—'}
                    {it.expiry_date && (
                      <span className="font-mono ml-2">{it.expiry_date}</span>
                    )}
                  </div>
                </div>
                <div className={`text-xs ${badge.className}`}>{badge.label}</div>
                <button
                  type="button"
                  onClick={() => handleDelete(it.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded border border-card-border text-xs text-muted hover:border-danger hover:text-danger"
                  aria-label="削除"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
