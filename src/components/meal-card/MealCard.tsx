'use client'

import Link from 'next/link'
import type { DbRecipe, MealType } from '@/types/database'

export type MealSlot = Exclude<MealType, 'any'>

export interface MealCardProps {
  slot: MealSlot
  recipe: DbRecipe | null
  isLocked?: boolean
  isEatingOut?: boolean
  onClick?: () => void
  onToggleLock?: () => void
}

const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: '朝',
  lunch: '昼',
  dinner: '夜',
}

const SLOT_ACCENT: Record<MealSlot, string> = {
  breakfast: 'border-l-warning',
  lunch: 'border-l-success',
  dinner: 'border-l-accent',
}

export function MealCard({
  slot,
  recipe,
  isLocked = false,
  isEatingOut = false,
  onClick,
  onToggleLock,
}: MealCardProps) {
  const state: 'normal' | 'locked' | 'eating-out' | 'empty' = isEatingOut
    ? 'eating-out'
    : isLocked
      ? 'locked'
      : recipe
        ? 'normal'
        : 'empty'

  const baseClass = `hud-border bg-card text-foreground border-l-4 ${SLOT_ACCENT[slot]} p-3 flex flex-col gap-1 min-h-[88px] text-left w-full transition-opacity`
  const stateClass =
    state === 'empty'
      ? 'opacity-60 border-dashed'
      : state === 'eating-out'
        ? 'opacity-80'
        : ''

  const content = (
    <>
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-bold tracking-wider">{SLOT_LABEL[slot]}</span>
        <div className="flex items-center gap-1">
          {isLocked && (
            <span
              className="text-accent"
              title="ロック中"
              aria-label="ロック中"
            >
              🔒
            </span>
          )}
          {isEatingOut && <span title="外食">🍽</span>}
        </div>
      </div>
      <div className="flex-1 flex items-center">
        {state === 'eating-out' ? (
          <span className="text-sm">外食</span>
        ) : state === 'empty' ? (
          <span className="text-sm text-muted">未定</span>
        ) : (
          <span className="text-sm font-medium line-clamp-2">{recipe!.name}</span>
        )}
      </div>
      {recipe && state !== 'eating-out' && (
        <div className="flex items-center gap-2 text-xs text-muted">
          {recipe.cooking_time_minutes != null && (
            <span>⏱ {recipe.cooking_time_minutes}分</span>
          )}
          {recipe.cuisine_genre && <span>{recipe.cuisine_genre}</span>}
        </div>
      )}
    </>
  )

  return (
    <div className="relative">
      {recipe && state === 'normal' ? (
        <Link
          href={`/recipes/${recipe.id}`}
          onClick={onClick}
          className={`${baseClass} ${stateClass} block hover:border-accent`}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={`${baseClass} ${stateClass} hover:border-accent`}
        >
          {content}
        </button>
      )}
      {onToggleLock && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleLock()
          }}
          className="absolute top-2 right-2 text-xs text-muted hover:text-accent"
          aria-label={isLocked ? 'ロック解除' : 'ロックする'}
        >
          {isLocked ? '解除' : '固定'}
        </button>
      )}
    </div>
  )
}
