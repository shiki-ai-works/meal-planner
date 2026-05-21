'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_EMOJI, CATEGORY_ORDER } from '@/lib/shopping-list'
import type {
  DbPantryTemplate,
  Ingredient,
  PantryTemplateItem,
} from '@/types/database'

interface Props {
  initial: DbPantryTemplate | null
}

const PRESETS: PantryTemplateItem[] = [
  { name: '米', category: 'その他', default_amount: null, unit: null },
  { name: 'ご飯', category: 'その他', default_amount: null, unit: null },
  { name: '塩', category: '調味料', default_amount: null, unit: null },
  { name: 'こしょう', category: '調味料', default_amount: null, unit: null },
  { name: '醤油', category: '調味料', default_amount: null, unit: null },
  { name: '砂糖', category: '調味料', default_amount: null, unit: null },
  { name: 'みりん', category: '調味料', default_amount: null, unit: null },
  { name: '酒', category: '調味料', default_amount: null, unit: null },
  { name: '酢', category: '調味料', default_amount: null, unit: null },
  { name: 'サラダ油', category: '調味料', default_amount: null, unit: null },
  { name: 'ごま油', category: '調味料', default_amount: null, unit: null },
  { name: 'バター', category: '乳製品', default_amount: null, unit: null },
  { name: 'にんにく', category: '青果', default_amount: null, unit: null },
  { name: 'しょうが', category: '青果', default_amount: null, unit: null },
  { name: 'だし', category: '調味料', default_amount: null, unit: null },
  { name: '味噌', category: '調味料', default_amount: null, unit: null },
]

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFKC')
}

export function PantryClient({ initial }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [items, setItems] = useState<PantryTemplateItem[]>(initial?.items ?? [])
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<Ingredient['category']>('調味料')

  const existingNames = useMemo(
    () => new Set(items.map((i) => normalize(i.name))),
    [items]
  )

  const grouped = useMemo(() => {
    const g: Record<Ingredient['category'], PantryTemplateItem[]> = {
      青果: [],
      鮮魚: [],
      精肉: [],
      乳製品: [],
      乾物: [],
      調味料: [],
      その他: [],
    }
    for (const it of items) g[it.category].push(it)
    for (const cat of CATEGORY_ORDER) {
      g[cat].sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    }
    return g
  }, [items])

  function addItem(item: PantryTemplateItem) {
    const key = normalize(item.name)
    if (!key) return
    if (existingNames.has(key)) return
    setItems((prev) => [...prev, item])
  }

  function removeItem(name: string) {
    const key = normalize(name)
    setItems((prev) => prev.filter((it) => normalize(it.name) !== key))
  }

  function handleAddNew() {
    const name = newName.trim()
    if (!name) return
    addItem({
      name,
      category: newCategory,
      default_amount: null,
      unit: null,
    })
    setNewName('')
  }

  function handleSave() {
    setError(null)
    setSavedAt(null)
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('ログインが必要です')
        return
      }
      const { error: upErr } = await supabase
        .from('pantry_templates')
        .upsert(
          { user_id: user.id, items },
          { onConflict: 'user_id' }
        )
      if (upErr) {
        setError(upErr.message)
        return
      }
      setSavedAt(new Date().toLocaleTimeString('ja-JP'))
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 現在の登録 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold">登録済み</h2>
          <span className="text-xs text-muted font-mono">{items.length} 件</span>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-muted">
            まだ登録がありません。下の「よく使う常備品」から追加できます。
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {CATEGORY_ORDER.map((cat) => {
              const list = grouped[cat]
              if (list.length === 0) return null
              return (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="text-[10px] text-muted">
                    {CATEGORY_EMOJI[cat]} {cat}
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {list.map((it) => (
                      <li
                        key={it.name}
                        className="flex items-center gap-1 border border-card-border rounded px-2 py-0.5 text-xs"
                      >
                        <span>{it.name}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(it.name)}
                          className="text-muted hover:text-danger"
                          aria-label={`${it.name} を削除`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 個別追加 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-2">
        <h2 className="text-sm font-bold">手動で追加</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddNew()
              }
            }}
            placeholder="例: ケチャップ"
            className="flex-1 bg-transparent border border-card-border rounded px-2 py-1 text-sm"
          />
          <select
            value={newCategory}
            onChange={(e) =>
              setNewCategory(e.target.value as Ingredient['category'])
            }
            className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
          >
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_EMOJI[cat]} {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddNew}
            className="bg-accent text-white text-xs font-bold px-3 rounded"
          >
            追加
          </button>
        </div>
      </section>

      {/* プリセット */}
      <section className="hud-border bg-card p-3 flex flex-col gap-2">
        <h2 className="text-sm font-bold">よく使う常備品</h2>
        <p className="text-[10px] text-muted">タップで追加（登録済みは選択不可）</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => {
            const already = existingNames.has(normalize(preset.name))
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => addItem(preset)}
                disabled={already}
                className={`border rounded px-2 py-0.5 text-xs ${
                  already
                    ? 'border-card-border text-muted opacity-50 cursor-not-allowed'
                    : 'border-accent text-accent hover:bg-accent hover:text-white'
                }`}
              >
                {already ? '✓ ' : '+ '}
                {preset.name}
              </button>
            )
          })}
        </div>
      </section>

      {error && (
        <div className="hud-border bg-card p-3 text-sm text-danger">{error}</div>
      )}
      {savedAt && (
        <div className="hud-border bg-card p-3 text-sm text-success">
          {savedAt} に保存しました
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="bg-accent text-white text-sm font-bold px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending ? '保存中…' : '保存'}
      </button>
    </div>
  )
}
