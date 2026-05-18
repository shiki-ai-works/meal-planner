'use client'

import { useMemo, useState } from 'react'
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

  const sodium = n.minerals?.sodium ?? 0
  const saltG = round1((sodium * scale * 2.54) / 1000)

  return (
    <>
      {/* 人数切替 */}
      <section className="hud-border bg-card p-3 flex items-center gap-3">
        <label className="text-xs text-muted">何人分</label>
        <button
          type="button"
          onClick={() => setServings(Math.max(1, servings - 1))}
          className="w-7 h-7 border border-card-border rounded"
          aria-label="減らす"
        >
          −
        </button>
        <span className="text-sm font-mono w-8 text-center">{servings}</span>
        <button
          type="button"
          onClick={() => setServings(Math.min(12, servings + 1))}
          className="w-7 h-7 border border-card-border rounded"
          aria-label="増やす"
        >
          +
        </button>
        <span className="text-[10px] text-muted ml-auto">
          基準 {baseServings}人前
        </span>
      </section>

      {/* 栄養価 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold">栄養価（{servings}人分）</h2>
          <span className="text-xs font-mono">{scaledN.calories} kcal</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded border border-card-border">
          <div className="bg-accent" style={{ width: `${pfc.p}%` }} />
          <div className="bg-warning" style={{ width: `${pfc.f}%` }} />
          <div className="bg-success" style={{ width: `${pfc.c}%` }} />
        </div>
        <div className="grid grid-cols-3 text-[10px] font-mono text-muted">
          <span>
            <span className="text-accent">P</span> {scaledN.protein}g (
            {pfc.p.toFixed(0)}%)
          </span>
          <span>
            <span className="text-warning">F</span> {scaledN.fat}g (
            {pfc.f.toFixed(0)}%)
          </span>
          <span>
            <span className="text-success">C</span> {scaledN.carbs}g (
            {pfc.c.toFixed(0)}%)
          </span>
        </div>
        <div className="grid grid-cols-2 text-[10px] text-muted mt-1 gap-y-0.5">
          <span>食物繊維</span>
          <span className="text-right font-mono">{scaledN.fiber} g</span>
          <span>食塩相当量</span>
          <span className="text-right font-mono">{saltG} g</span>
          {n.minerals && (
            <>
              <span>鉄</span>
              <span className="text-right font-mono">
                {round1((n.minerals.iron ?? 0) * scale)} mg
              </span>
              <span>カルシウム</span>
              <span className="text-right font-mono">
                {round1((n.minerals.calcium ?? 0) * scale)} mg
              </span>
            </>
          )}
        </div>
      </section>

      {/* 材料 */}
      <section className="hud-border bg-card p-3 flex flex-col gap-2">
        <h2 className="text-sm font-bold">材料（{servings}人分）</h2>
        <ul className="flex flex-col gap-1">
          {scaledIngredients.map((ing) => (
            <li
              key={`${ing.name}__${ing.unit}`}
              className="flex items-center justify-between text-sm py-0.5 border-b border-card-border/40 last:border-0"
            >
              <span>
                <span className="text-[10px] text-muted mr-2">
                  {ing.category}
                </span>
                {ing.name}
              </span>
              <span className="font-mono text-xs">
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
        <ol className="flex flex-col gap-3">
          {recipe.steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.order} className="flex gap-3">
                <span className="text-accent font-bold text-sm w-6 shrink-0">
                  {step.order}.
                </span>
                <p className="text-sm">{step.description}</p>
              </li>
            ))}
        </ol>
      </section>
    </>
  )
}
