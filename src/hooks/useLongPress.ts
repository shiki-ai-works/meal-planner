'use client'

import { useCallback, useRef } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  delayMs?: number
  moveTolerancePx?: number
}

interface PointerHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  onTouchCancel: () => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

export function useLongPress({
  onLongPress,
  delayMs = 500,
  moveTolerancePx = 10,
}: UseLongPressOptions): PointerHandlers & { didLongPressRef: React.RefObject<boolean> } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const didLongPressRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startPosRef.current = null
  }, [])

  const start = useCallback(
    (x: number, y: number) => {
      didLongPressRef.current = false
      startPosRef.current = { x, y }
      timerRef.current = setTimeout(() => {
        didLongPressRef.current = true
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(50)
          } catch {
            // ignore (some browsers throw on user-gesture requirement)
          }
        }
        onLongPress()
        timerRef.current = null
      }, delayMs)
    },
    [delayMs, onLongPress],
  )

  const moveIfFar = useCallback(
    (x: number, y: number) => {
      const s = startPosRef.current
      if (!s) return
      const dx = x - s.x
      const dy = y - s.y
      if (dx * dx + dy * dy > moveTolerancePx * moveTolerancePx) {
        clear()
      }
    },
    [clear, moveTolerancePx],
  )

  return {
    didLongPressRef,
    onTouchStart: (e) => {
      const t = e.touches[0]
      if (!t) return
      start(t.clientX, t.clientY)
    },
    onTouchMove: (e) => {
      const t = e.touches[0]
      if (!t) return
      moveIfFar(t.clientX, t.clientY)
    },
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: (e) => start(e.clientX, e.clientY),
    onMouseMove: (e) => moveIfFar(e.clientX, e.clientY),
    onMouseUp: clear,
    onMouseLeave: clear,
    onContextMenu: (e) => {
      e.preventDefault()
    },
  }
}
