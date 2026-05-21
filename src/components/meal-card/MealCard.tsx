'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { cuisineBorderColor, fallbackEmoji } from '@/lib/cuisine'
import { useLongPress } from '@/hooks/useLongPress'
import type { DbRecipe, MealType } from '@/types/database'

export type MealSlot = Exclude<MealType, 'any'>

export interface MealCardProps {
  slot: MealSlot
  recipe: DbRecipe | null
  isLocked?: boolean
  isEatingOut?: boolean
  onToggleEatingOut?: () => void
}

const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: '朝',
  lunch: '昼',
  dinner: '夜',
}

const GRADIENT_OVERLAY =
  'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.75) 100%)'
const EATING_OUT_TINT =
  'linear-gradient(180deg, rgba(245,158,11,0.35) 0%, rgba(0,0,0,0.55) 100%)'

export function MealCard({
  slot,
  recipe,
  isLocked = false,
  isEatingOut = false,
  onToggleEatingOut,
}: MealCardProps) {
  const longPress = useLongPress({
    onLongPress: () => {
      if (onToggleEatingOut) onToggleEatingOut()
    },
  })

  const borderColor = cuisineBorderColor(recipe?.cuisine_genre ?? null)
  const photoUrl = recipe?.image_urls?.[0] ?? null
  const emoji = fallbackEmoji(recipe?.cuisine_genre ?? null, slot)

  const hasRecipe = !!recipe
  const showAsEatingOut = isEatingOut
  const showAsEmpty = !hasRecipe && !isEatingOut

  const bgStyle: CSSProperties = { borderLeftColor: borderColor }
  if (photoUrl) {
    bgStyle.backgroundImage = `url(${photoUrl})`
    bgStyle.backgroundSize = 'cover'
    bgStyle.backgroundPosition = 'center'
  } else if (showAsEmpty) {
    bgStyle.backgroundColor = '#ffffff'
  } else {
    bgStyle.backgroundColor = '#fef3e2'
  }

  const baseClass = [
    'hud-border relative overflow-hidden block w-full text-left',
    'aspect-square min-h-[120px]',
    'border-l-4',
    'transition-transform duration-150 active:scale-[0.97]',
    'select-none',
  ].join(' ')

  const emptyClass = showAsEmpty ? 'border-dashed opacity-70' : ''

  const inner = (
    <>
      {!photoUrl && !showAsEmpty && !showAsEatingOut && (
        <div className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          {emoji}
        </div>
      )}

      {!showAsEmpty && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: GRADIENT_OVERLAY }}
        />
      )}

      {showAsEatingOut && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: EATING_OUT_TINT }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-5xl pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            🍽
          </div>
        </>
      )}

      <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between text-[11px] z-10">
        <span className="bg-white/85 text-foreground px-2 py-0.5 rounded-full font-bold tracking-wider backdrop-blur-sm">
          {SLOT_LABEL[slot]}
        </span>
        <div className="flex gap-1">
          {isLocked && (
            <span
              className="bg-black/45 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm"
              title="ロック中"
            >
              🔒
            </span>
          )}
          {showAsEatingOut && (
            <span
              className="bg-black/45 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm"
              title="外食"
            >
              外食
            </span>
          )}
        </div>
      </div>

      <div className="absolute left-2 right-2 bottom-1.5 z-10">
        {showAsEmpty ? (
          <div className="text-muted text-sm">未定</div>
        ) : (
          <>
            <div
              className={`text-white text-sm font-bold leading-tight ${
                showAsEatingOut ? 'opacity-50' : ''
              }`}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
            >
              {recipe?.name ?? '外食'}
            </div>
            {!showAsEatingOut && recipe && (
              <div
                className="flex gap-1.5 text-[10px] text-white/90 mt-0.5"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
              >
                {recipe.cooking_time_minutes != null && (
                  <span>⏱ {recipe.cooking_time_minutes}分</span>
                )}
                {recipe.cuisine_genre && <span>{recipe.cuisine_genre}</span>}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )

  const pointerHandlers = {
    onTouchStart: longPress.onTouchStart,
    onTouchMove: longPress.onTouchMove,
    onTouchEnd: longPress.onTouchEnd,
    onTouchCancel: longPress.onTouchCancel,
    onMouseDown: longPress.onMouseDown,
    onMouseMove: longPress.onMouseMove,
    onMouseUp: longPress.onMouseUp,
    onMouseLeave: longPress.onMouseLeave,
    onContextMenu: longPress.onContextMenu,
  }

  if (hasRecipe && !showAsEatingOut) {
    return (
      <Link
        href={`/recipes/${recipe!.id}`}
        style={bgStyle}
        className={baseClass}
        onClick={(e) => {
          if (longPress.didLongPressRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        {...pointerHandlers}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      style={bgStyle}
      className={`${baseClass} ${emptyClass}`}
      {...pointerHandlers}
    >
      {inner}
    </button>
  )
}
