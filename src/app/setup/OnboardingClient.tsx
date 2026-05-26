'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  PLANNING_GOAL_OPTIONS,
  SELF_COOK_FREQUENCY_OPTIONS,
  type PlanningGoal,
  type SelfCookFrequency,
} from '@/lib/onboarding'
import { PERSONA_LIST } from '@/lib/personas'
import { createClient } from '@/lib/supabase/client'
import type { DbUser, PersonaId } from '@/types/database'

interface Props {
  email: string
  initialUser: DbUser | null
  weekStartDate: string
}

function parseList(s: string): string[] {
  return s
    .split(/[,、\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export function OnboardingClient({ email, initialUser, weekStartDate }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(initialUser?.display_name ?? '')
  const [servings, setServings] = useState(
    String(initialUser?.default_servings ?? 2),
  )
  const [disliked, setDisliked] = useState(
    (initialUser?.disliked_ingredients ?? []).join('、'),
  )
  const [allergic, setAllergic] = useState(
    (initialUser?.allergic_ingredients ?? []).join('、'),
  )
  const [selfCookFrequency, setSelfCookFrequency] = useState<SelfCookFrequency>(
    initialUser?.self_cook_frequency ?? 'sometimes',
  )
  const [planningGoal, setPlanningGoal] = useState<PlanningGoal>(
    initialUser?.planning_goal ?? 'balanced',
  )
  const [persona, setPersona] = useState<PersonaId>(
    initialUser?.selected_persona ?? 'mei',
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const servingsNum = Number(servings)
    if (!Number.isFinite(servingsNum) || servingsNum < 1 || servingsNum > 12) {
      setError('人数は 1〜12 で指定してください')
      return
    }

    startTransition(async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser().catch(() => ({
        data: { user: null },
        error: new Error('通信に失敗しました。接続を確認してください。'),
      }))

      if (authError || !user) {
        setError(
          authError?.message ??
            'ログインが必要です。もう一度ログインしてから設定してください。',
        )
        return
      }

      let saveError: { message: string } | null = null
      try {
        const result = await supabase.from('users').upsert(
          {
            id: user.id,
            display_name: displayName.trim() || null,
            default_servings: servingsNum,
            disliked_ingredients: parseList(disliked),
            allergic_ingredients: parseList(allergic),
            selected_persona: persona,
            self_cook_frequency: selfCookFrequency,
            planning_goal: planningGoal,
            onboarding_completed_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
        saveError = result.error
      } catch {
        saveError = {
          message: '初期設定を保存できませんでした。接続を確認してください。',
        }
      }

      if (saveError) {
        setError(`初期設定を保存できませんでした: ${saveError.message}`)
        return
      }

      try {
        const response = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaId: persona, weekStartDate }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          const message =
            typeof body.error === 'string' ? body.error : `HTTP ${response.status}`
          throw new Error(message)
        }

        router.push('/dashboard')
        router.refresh()
      } catch (generateError) {
        setError(
          `設定は保存しましたが、最初の献立生成に失敗しました: ${
            generateError instanceof Error ? generateError.message : '原因不明のエラー'
          }`,
        )
      }
    })
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <section className="hud-border bg-card p-5">
          <p className="mb-2 text-xs font-bold text-accent">FIRST SETUP</p>
          <h1 className="text-xl font-bold">最初の献立を作るための設定</h1>
          <p className="mt-3 text-sm text-muted">
            {email} でログイン中です。まず人数や避けたい食材を決めると、
            このあとすぐ 1 週間分の献立を生成します。
          </p>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <section className="hud-border bg-card p-5">
            <h2 className="text-sm font-bold">基本</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                表示名
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="あなたの名前"
                  className="min-h-10 rounded border border-card-border bg-background px-3 text-sm text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                人数
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="min-h-10 rounded border border-card-border bg-background px-3 text-sm text-foreground"
                />
              </label>
            </div>
          </section>

          <section className="hud-border bg-card p-5">
            <h2 className="text-sm font-bold">自炊頻度</h2>
            <div className="mt-3 grid gap-2">
              {SELF_COOK_FREQUENCY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer gap-3 rounded border border-card-border bg-background p-3"
                >
                  <input
                    type="radio"
                    name="self-cook-frequency"
                    value={option.value}
                    checked={selfCookFrequency === option.value}
                    onChange={() => setSelfCookFrequency(option.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="hud-border bg-card p-5">
            <h2 className="text-sm font-bold">目標</h2>
            <div className="mt-3 grid gap-2">
              {PLANNING_GOAL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer gap-3 rounded border border-card-border bg-background p-3"
                >
                  <input
                    type="radio"
                    name="planning-goal"
                    value={option.value}
                    checked={planningGoal === option.value}
                    onChange={() => setPlanningGoal(option.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="hud-border bg-card p-5">
            <h2 className="text-sm font-bold">献立の好み</h2>
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs text-muted">
                優先ペルソナ
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as PersonaId)}
                  className="min-h-10 rounded border border-card-border bg-background px-3 text-sm text-foreground"
                >
                  {PERSONA_LIST.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.catchphrase}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                苦手な食材
                <textarea
                  value={disliked}
                  onChange={(e) => setDisliked(e.target.value)}
                  rows={2}
                  placeholder="例: パクチー、レバー"
                  className="rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                アレルギー食材
                <textarea
                  value={allergic}
                  onChange={(e) => setAllergic(e.target.value)}
                  rows={2}
                  placeholder="例: えび、かに、そば"
                  className="rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
          </section>

          {error && (
            <div className="hud-border bg-card p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="min-h-12 rounded bg-accent px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isPending ? '保存して献立を生成中...' : '保存して最初の献立を作る'}
          </button>
        </form>
      </div>
    </main>
  )
}
