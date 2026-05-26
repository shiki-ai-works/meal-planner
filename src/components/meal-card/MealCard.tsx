'use client'

import Link from 'next/link'
import type { CSSProperties, KeyboardEvent } from 'react'
import { cuisineBackground, cuisineBorderColor, fallbackEmoji } from '@/lib/cuisine'
import { useLongPress } from '@/hooks/useLongPress'
import type { DbRecipe, MealType } from '@/types/database'

export type MealSlot = Exclude<MealType, 'any'>

export interface MealCardProps {
  slot: MealSlot
  recipe: DbRecipe | null
  isLocked?: boolean
  isEatingOut?: boolean
  onToggleEatingOut?: () => void
  onToggleLocked?: () => void
  href?: string | null
  onSelect?: () => void
  reason?: string | null
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

function firstImageUrl(urls: string[] | null | undefined) {
  return urls?.find((url) => url.trim().length > 0)?.trim() ?? null
}

export function MealCard({
  slot,
  recipe,
  isLocked = false,
  isEatingOut = false,
  onToggleEatingOut,
  onToggleLocked,
  href,
  onSelect,
  reason,
}: MealCardProps) {
  const longPress = useLongPress({
    onLongPress: () => {
      if (onToggleEatingOut) onToggleEatingOut()
    },
  })

  const borderColor = cuisineBorderColor(recipe?.cuisine_genre ?? null)
  const photoUrl = firstImageUrl(recipe?.image_urls)
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
    bgStyle.backgroundImage = cuisineBackground(recipe?.cuisine_genre ?? null)
  }

  const baseClass = [
    'hud-border relative overflow-hidden block w-full text-left',
    'aspect-[16/9] min-h-[116px] sm:aspect-square sm:min-h-[120px]',
    'border-l-4',
    'shadow-[0_8px_18px_rgba(26,31,46,0.08)]',
    'transition-transform duration-150 active:scale-[0.97] hover:-translate-y-0.5',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
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

      <div className="pointer-events-none absolute top-1.5 left-2 right-2 z-10 flex items-center justify-between text-[11px]">
        <span className="bg-white/85 text-foreground px-2 py-0.5 rounded-full font-bold tracking-wider backdrop-blur-sm">
          {SLOT_LABEL[slot]}
        </span>
        <div className="flex items-center gap-1">
          {onToggleLocked && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onToggleLocked()
              }}
              className={`pointer-events-auto grid h-7 w-7 place-items-center rounded-full border text-xs backdrop-blur-sm transition ${
                isLocked
                  ? 'border-accent bg-accent text-white'
                  : 'border-white/70 bg-white/86 text-foreground'
              }`}
              title={isLocked ? '固定を解除' : 'この枠を固定'}
              aria-label={`${SLOT_LABEL[slot]}を${isLocked ? '固定解除' : '固定'}`}
            >
              {isLocked ? '🔒' : '🔓'}
            </button>
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

      <div className="pointer-events-none absolute left-2 right-2 bottom-1.5 z-10">
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
            {reason && (
              <div
                className="mt-1 max-w-full truncate rounded bg-black/35 px-1.5 py-0.5 text-[10px] text-white/95 backdrop-blur-sm"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                title={reason}
              >
                {reason}
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

  function handleToggleKeyDown(e: KeyboardEvent) {
    if (!onToggleEatingOut || !e.shiftKey) return
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    e.stopPropagation()
    onToggleEatingOut()
  }

  function handleButtonClick() {
    if (longPress.didLongPressRef.current) return
    onSelect?.()
  }

  const actionLabel = showAsEatingOut ? '手作りに戻す' : '外食にする'
  const cardLabel = hasRecipe
    ? `${SLOT_LABEL[slot]} ${recipe!.name}${reason ? `。理由: ${reason}` : ''}。Shift Enterで${actionLabel}`
    : `${SLOT_LABEL[slot]} 未定。Shift Enterで${actionLabel}`

  const recipeHref = href === undefined ? `/recipes/${recipe?.id}` : href

  const clickLayerClass =
    'absolute inset-0 z-[1] rounded-[7px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

  if (hasRecipe && !showAsEatingOut && recipeHref) {
    return (
      <div
        style={bgStyle}
        className={`${baseClass} ${emptyClass}`}
      >
        <Link
          href={recipeHref}
          className={clickLayerClass}
          aria-label={cardLabel}
          title="長押し、または Shift+Enter で外食を切替"
          onClick={(e) => {
            if (longPress.didLongPressRef.current) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          onKeyDown={handleToggleKeyDown}
          {...pointerHandlers}
        />
        {inner}
      </div>
    )
  }

  return (
    <div
      style={bgStyle}
      className={`${baseClass} ${emptyClass}`}
    >
      <button
        type="button"
        className={clickLayerClass}
        aria-label={cardLabel}
        title="長押し、または Shift+Enter で外食を切替"
        onKeyDown={handleToggleKeyDown}
        onClick={handleButtonClick}
        {...pointerHandlers}
      />
      {inner}
    </div>
  )
}
