'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  USER_DATA_DELETE_CONFIRMATION,
  USER_DATA_DELETE_CONFIRMATION_HEADER,
  USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE,
} from '@/lib/user-data'

const CONFIRM_TEXT = USER_DATA_DELETE_CONFIRMATION

function fallbackErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function fileNameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/)
  return match?.[1] ?? `meal-planner-user-data-${new Date().toISOString().slice(0, 10)}.json`
}

export function DataControlsClient() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isExporting, startExportTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleExport() {
    setMessage(null)
    setError(null)
    startExportTransition(async () => {
      try {
        const response = await fetch('/api/user-data/export', {
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setError(
            typeof body.error === 'string'
              ? body.error
              : 'データを書き出せませんでした',
          )
          return
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = fileNameFromDisposition(
          response.headers.get('Content-Disposition'),
        )
        document.body.append(anchor)
        anchor.click()
        anchor.remove()
        URL.revokeObjectURL(url)
        setMessage('JSON ファイルを書き出しました')
      } catch (exportError) {
        setError(
          fallbackErrorMessage(
            exportError,
            'データを書き出せませんでした。通信状態を確認してください。',
          ),
        )
      }
    })
  }

  function handleDelete() {
    if (confirmText !== CONFIRM_TEXT) return
    setMessage(null)
    setError(null)
    startDeleteTransition(async () => {
      try {
        const response = await fetch('/api/user-data/delete', {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            [USER_DATA_DELETE_CONFIRMATION_HEADER]:
              USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE,
          },
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setError(
            typeof body.error === 'string'
              ? body.error
              : 'データを削除できませんでした',
          )
          return
        }

        await supabase.auth.signOut()
        setConfirmOpen(false)
        setConfirmText('')
        router.push('/login')
        router.refresh()
      } catch (deleteError) {
        setError(
          fallbackErrorMessage(
            deleteError,
            'データを削除できませんでした。通信状態を確認してください。',
          ),
        )
      }
    })
  }

  return (
    <section className="hud-border bg-card p-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold">データの書き出しと削除</h2>
        <p className="text-[10px] text-muted">
          設定、献立、在庫、常備品、買い物リスト履歴を JSON で取得できます。
          削除はアプリ内の保存データだけを対象にします。
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="min-h-10 rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {isExporting ? '書き出し中...' : 'JSON を書き出す'}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setMessage(null)
            setConfirmOpen(true)
          }}
          disabled={isDeleting}
          className="min-h-10 rounded border border-danger bg-white px-3 text-xs font-bold text-danger hover:bg-red-50 disabled:opacity-50"
        >
          データを削除
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded border border-card-border bg-background px-3 py-2 text-xs text-success">
          {message}
        </p>
      )}
      {error && (
        <div className="mt-3 rounded border border-card-border bg-background px-3 py-2" role="alert">
          <p className="text-xs font-bold text-danger">処理できませんでした</p>
          <p className="mt-1 text-xs text-muted">{error}</p>
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-foreground/35 px-3 pb-3 backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-data-title"
        >
          <section className="hud-border w-full max-w-md bg-card p-4 shadow-[0_16px_36px_rgba(26,31,46,0.22)]">
            <h3 id="delete-data-title" className="text-sm font-bold text-danger">
              アプリ内データを削除します
            </h3>
            <p className="mt-2 text-xs text-muted">
              設定、献立、在庫、常備品、固定枠、買い物リスト履歴を削除します。
              認証アカウント自体は Supabase Auth 側に残ります。
            </p>
            <label className="mt-3 flex flex-col gap-1 text-xs text-muted">
              確認のため「{CONFIRM_TEXT}」と入力
              <input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                className="min-h-10 rounded border border-card-border bg-background px-3 text-sm text-foreground"
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false)
                  setConfirmText('')
                }}
                disabled={isDeleting}
                className="min-h-10 rounded border border-card-border bg-white px-3 text-xs font-bold text-muted hover:border-accent hover:text-accent disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_TEXT || isDeleting}
                className="min-h-10 rounded bg-danger px-3 text-xs font-bold text-white disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
