'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PERSONA_LIST } from '@/lib/personas'
import type { DbUser, PersonaId } from '@/types/database'

interface Props {
  initialUser: DbUser | null
}

function parseList(s: string): string[] {
  return s
    .split(/[,、\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export function SettingsClient({ initialUser }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(initialUser?.display_name ?? '')
  const [servings, setServings] = useState(
    String(initialUser?.default_servings ?? 2)
  )
  const [disliked, setDisliked] = useState(
    (initialUser?.disliked_ingredients ?? []).join('、')
  )
  const [allergic, setAllergic] = useState(
    (initialUser?.allergic_ingredients ?? []).join('、')
  )
  const [persona, setPersona] = useState<PersonaId>(
    initialUser?.selected_persona ?? 'mei'
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSavedAt(null)

    const servingsNum = Number(servings)
    if (!Number.isFinite(servingsNum) || servingsNum < 1 || servingsNum > 12) {
      setError('人数は 1〜12 で指定してください')
      return
    }

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('ログインが必要です')
        return
      }

      const { error: updErr } = await supabase
        .from('users')
        .update({
          display_name: displayName.trim() || null,
          default_servings: servingsNum,
          disliked_ingredients: parseList(disliked),
          allergic_ingredients: parseList(allergic),
          selected_persona: persona,
        })
        .eq('id', user.id)

      if (updErr) {
        setError(updErr.message)
        return
      }
      setSavedAt(new Date().toLocaleTimeString('ja-JP'))
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="hud-border bg-card p-3 flex flex-col gap-2">
        <label className="text-xs text-muted">表示名</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="あなたの名前"
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="hud-border bg-card p-3 flex flex-col gap-2">
        <label className="text-xs text-muted">既定の人数</label>
        <input
          type="number"
          min={1}
          max={12}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm w-24"
        />
        <p className="text-[10px] text-muted">
          レシピの材料量スケール初期値に使われます
        </p>
      </div>

      <div className="hud-border bg-card p-3 flex flex-col gap-2">
        <label className="text-xs text-muted">優先ペルソナ</label>
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value as PersonaId)}
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
        >
          {PERSONA_LIST.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.catchphrase}
            </option>
          ))}
        </select>
      </div>

      <div className="hud-border bg-card p-3 flex flex-col gap-2">
        <label className="text-xs text-muted">
          苦手な食材（カンマ・読点・改行区切り）
        </label>
        <textarea
          value={disliked}
          onChange={(e) => setDisliked(e.target.value)}
          rows={2}
          placeholder="例: パクチー、レバー"
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="hud-border bg-card p-3 flex flex-col gap-2">
        <label className="text-xs text-muted">
          アレルギー食材（カンマ・読点・改行区切り）
        </label>
        <textarea
          value={allergic}
          onChange={(e) => setAllergic(e.target.value)}
          rows={2}
          placeholder="例: えび、かに、そば"
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm"
        />
        <p className="text-[10px] text-warning">
          これらを含むレシピは献立から完全に除外されます
        </p>
      </div>

      {error && (
        <div className="hud-border bg-card p-3 text-sm text-danger">{error}</div>
      )}
      {savedAt && (
        <div className="hud-border bg-card p-3 text-sm text-success">
          {savedAt} に保存しました
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-white text-sm font-bold px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending ? '保存中…' : '保存'}
      </button>
    </form>
  )
}
