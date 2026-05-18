'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PERSONA_LIST } from '@/lib/personas'
import {
  CALORIE_RANGE,
  PFC_RANGE,
  type DbUser,
  type PersonaId,
} from '@/types/database'

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
  const [targetCal, setTargetCal] = useState(
    String(initialUser?.target_calories ?? 2000)
  )
  const [p, setP] = useState(initialUser?.target_pfc_protein ?? 20)
  const [f, setF] = useState(initialUser?.target_pfc_fat ?? 25)
  const [c, setC] = useState(initialUser?.target_pfc_carbs ?? 55)

  const pfcSum = p + f + c
  const pfcValid =
    pfcSum === 100 &&
    p >= PFC_RANGE.protein.min &&
    p <= PFC_RANGE.protein.max &&
    f >= PFC_RANGE.fat.min &&
    f <= PFC_RANGE.fat.max &&
    c >= PFC_RANGE.carbs.min &&
    c <= PFC_RANGE.carbs.max

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSavedAt(null)

    const servingsNum = Number(servings)
    if (!Number.isFinite(servingsNum) || servingsNum < 1 || servingsNum > 12) {
      setError('人数は 1〜12 で指定してください')
      return
    }

    const calNum = Number(targetCal)
    if (
      !Number.isFinite(calNum) ||
      calNum < CALORIE_RANGE.min ||
      calNum > CALORIE_RANGE.max
    ) {
      setError(
        `目標カロリーは ${CALORIE_RANGE.min}〜${CALORIE_RANGE.max} kcal で指定してください`
      )
      return
    }
    if (!pfcValid) {
      setError('PFCバランスは合計100%、各栄養素は許容範囲内で指定してください')
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
          target_calories: calNum,
          target_pfc_protein: p,
          target_pfc_fat: f,
          target_pfc_carbs: c,
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
        <label className="text-xs text-muted">
          目標カロリー（{CALORIE_RANGE.min}〜{CALORIE_RANGE.max} kcal/日）
        </label>
        <input
          type="number"
          min={CALORIE_RANGE.min}
          max={CALORIE_RANGE.max}
          step={50}
          value={targetCal}
          onChange={(e) => setTargetCal(e.target.value)}
          className="bg-transparent border border-card-border rounded px-2 py-1 text-sm w-32"
        />
      </div>

      <div className="hud-border bg-card p-3 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label className="text-xs text-muted">PFCバランス（合計100%）</label>
          <span
            className={`text-xs font-mono ${
              pfcValid ? 'text-success' : 'text-danger'
            }`}
          >
            計 {pfcSum}%
          </span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded border border-card-border">
          <div className="bg-accent" style={{ width: `${p}%` }} />
          <div className="bg-warning" style={{ width: `${f}%` }} />
          <div className="bg-success" style={{ width: `${c}%` }} />
        </div>

        {(
          [
            ['P タンパク質', p, setP, PFC_RANGE.protein, 'text-accent'],
            ['F 脂質', f, setF, PFC_RANGE.fat, 'text-warning'],
            ['C 炭水化物', c, setC, PFC_RANGE.carbs, 'text-success'],
          ] as const
        ).map(([label, value, setter, range, color]) => (
          <div key={label} className="flex items-center gap-2">
            <label className={`text-xs w-24 ${color}`}>{label}</label>
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={1}
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-mono w-12 text-right">{value}%</span>
          </div>
        ))}

        <p className="text-[10px] text-muted">
          ※ 偏りすぎを防ぐため P:{PFC_RANGE.protein.min}–{PFC_RANGE.protein.max}% /
          F:{PFC_RANGE.fat.min}–{PFC_RANGE.fat.max}% / C:{PFC_RANGE.carbs.min}–
          {PFC_RANGE.carbs.max}% の範囲内
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
        disabled={isPending || !pfcValid}
        className="bg-accent text-white text-sm font-bold px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending ? '保存中…' : '保存'}
      </button>
    </form>
  )
}
