'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import type { DbRecipe } from '@/types/database'

interface Props {
  recipe: DbRecipe
  defaultServings: number
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function RecipeDetailClient({ recipe, defaultServings }: Props) {
  const baseServings = recipe.base_servings || 1
  const [servings, setServings] = useState(defaultServings || baseServings)
  const scale = servings / baseServings

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        ...ing,
        amount: round1(ing.amount * scale),
      })),
    [recipe.ingredients, scale]
  )

  const n = recipe.nutrition
  const scaledN = {
    calories: Math.round(n.calories * scale),
    protein: round1(n.protein * scale),
    fat: round1(n.fat * scale),
    carbs: round1(n.carbs * scale),
    fiber: round1(n.fiber * scale),
  }

  const pKcal = scaledN.protein * 4
  const fKcal = scaledN.fat * 9
  const cKcal = scaledN.carbs * 4
  const sum = pKcal + fKcal + cKcal || 1
  const pfc = {
    p: (pKcal / sum) * 100,
    f: (fKcal / sum) * 100,
    c: (cKcal / sum) * 100,
  }
  const proteinDeg = (pfc.p / 100) * 360
  const fatDeg = proteinDeg + (pfc.f / 100) * 360
  const pfcDonutStyle: CSSProperties = {
    background: `conic-gradient(var(--accent) 0deg ${proteinDeg}deg, var(--warning) ${proteinDeg}deg ${fatDeg}deg, var(--success) ${fatDeg}deg 360deg)`,
  }

  const sodium = n.minerals?.sodium ?? 0
  const saltG = round1((sodium * scale * 2.54) / 1000)
  const nutritionItems = [
    { label: 'カロリー', value: `${scaledN.calories} kcal` },
    { label: 'タンパク質', value: `${scaledN.protein} g` },
    { label: '脂質', value: `${scaledN.fat} g` },
    { label: '炭水化物', value: `${scaledN.carbs} g` },
  ]

  return (
    <>
      {/* 人数切替 */}
      <section className="hud-border bg-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold leading-none sm:text-2xl">何人分</div>
          </div>
          <div className="grid grid-cols-[36px_48px_36px] items-center rounded border border-card-border overflow-hidden">
            <button
              type="button"
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="h-9 text-lg hover:bg-background disabled:opacity-40"
              aria-label="減らす"
              disabled={servings <= 1}
            >
              −
            </button>
            <span className="h-9 grid place-items-center border-x border-card-border font-mono text-sm">
              {servings}
            </span>
            <button
              type="button"
              onClick={() => setServings(Math.min(12, servings + 1))}
              className="h-9 text-lg hover:bg-background disabled:opacity-40"
              aria-label="増やす"
              disabled={servings >= 12}
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* 栄養価 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold">栄養価（{servings}人分）</h2>
          <span className="text-[10px] text-muted">三大栄養素の割合</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-stretch">
          <div className="grid gap-2 sm:grid-cols-2">
            {nutritionItems.map((item) => (
              <div
                key={item.label}
                className="min-h-[64px] rounded border border-card-border bg-background/35 px-2.5 py-2"
              >
                <span className="block text-[11px] text-muted">{item.label}</span>
                <span className="mt-1 block text-left font-mono text-xl font-bold leading-none sm:text-[22px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex h-full min-h-[184px] items-center justify-center gap-4 sm:flex-col sm:gap-2">
            <div
              className="relative h-36 w-36 shrink-0 rounded-full border border-card-border shadow-inner sm:h-40 sm:w-40"
              style={pfcDonutStyle}
              aria-label={`タンパク質 ${pfc.p.toFixed(0)}%、脂質 ${pfc.f.toFixed(0)}%、炭水化物 ${pfc.c.toFixed(0)}%`}
              role="img"
            >
              <div className="absolute inset-7 grid place-items-center rounded-full bg-card text-center text-xs font-bold leading-tight sm:inset-9">
                kcal比
              </div>
            </div>
            <div className="grid gap-1 text-xs text-muted">
              <span>
                <span className="text-accent">タンパク質</span>{' '}
                <span className="font-mono">{pfc.p.toFixed(0)}%</span>
              </span>
              <span>
                <span className="text-warning">脂質</span>{' '}
                <span className="font-mono">{pfc.f.toFixed(0)}%</span>
              </span>
              <span>
                <span className="text-success">炭水化物</span>{' '}
                <span className="font-mono">{pfc.c.toFixed(0)}%</span>
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-1 text-xs text-muted">
          <span className="border-b border-card-border/40 pb-1">食物繊維</span>
          <span className="border-b border-card-border/40 pb-1 text-left font-mono text-sm font-semibold text-foreground">
            {scaledN.fiber} g
          </span>
          <span className="border-b border-card-border/40 pb-1">食塩相当量</span>
          <span className="border-b border-card-border/40 pb-1 text-left font-mono text-sm font-semibold text-foreground">
            {saltG} g
          </span>
          {n.minerals && (
            <>
              <span className="border-b border-card-border/40 pb-1">鉄</span>
              <span className="border-b border-card-border/40 pb-1 text-left font-mono text-sm font-semibold text-foreground">
                {round1((n.minerals.iron ?? 0) * scale)} mg
              </span>
              <span>カルシウム</span>
              <span className="text-left font-mono text-sm font-semibold text-foreground">
                {round1((n.minerals.calcium ?? 0) * scale)} mg
              </span>
            </>
          )}
        </div>
      </section>

      {/* 材料 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-2">
        <h2 className="text-sm font-bold">材料（{servings}人分）</h2>
        <ul className="grid gap-1 sm:grid-cols-2">
          {scaledIngredients.map((ing) => (
            <li
              key={`${ing.name}__${ing.unit}`}
              className="min-h-12 flex items-center justify-between gap-3 rounded border border-card-border/50 px-3 py-2"
            >
              <span className="min-w-0 text-base font-semibold leading-snug">
                {ing.name}
              </span>
              <span className="shrink-0 font-mono text-lg font-bold leading-none sm:text-xl">
                {ing.amount}
                {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 手順 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-2">
        <h2 className="text-sm font-bold">手順</h2>
        <ol className="flex flex-col gap-4">
          {recipe.steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.order} className="grid grid-cols-[32px_1fr] gap-3">
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-bold text-white">
                  {step.order}
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed">{step.description}</p>
                  {step.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.image_url}
                      alt={`手順${step.order}`}
                      className="mt-2 aspect-video w-full rounded border border-card-border object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              </li>
            ))}
        </ol>
      </section>
    </>
  )
}
