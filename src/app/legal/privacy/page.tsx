import type { Metadata } from 'next'
import { APP_NAME, LEGAL_LAST_UPDATED } from '@/lib/legal'

export const metadata: Metadata = {
  title: `プライバシー | ${APP_NAME}`,
}

export default function PrivacyPage() {
  return (
    <article className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-bold text-accent">PRIVACY</p>
        <h2 className="mt-1 text-2xl font-bold">プライバシーポリシー</h2>
        <p className="mt-2 text-xs text-muted">最終更新: {LEGAL_LAST_UPDATED}</p>
      </header>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">扱う情報</h3>
        <p className="mt-2 text-sm text-muted">
          {APP_NAME} は、ログインのためのメールアドレス、表示名、好みや苦手食材、
          アレルギー入力、目標カロリー、PFC 目標、在庫、常備品、献立、買い物リストの情報を扱います。
          PFC はタンパク質・脂質・炭水化物のバランスを表す栄養の目安です。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">利用目的</h3>
        <p className="mt-2 text-sm text-muted">
          これらの情報は、献立生成、栄養表示、在庫との照合、買い物リスト作成、
          毎週固定メニューの管理、ログイン状態の維持、障害調査のために使います。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">外部サービス</h3>
        <p className="mt-2 text-sm text-muted">
          認証とデータ保存には Supabase を使います。デプロイ先では Vercel などの hosting
          サービスを使う場合があります。hosting は、アプリをインターネット上で動かす置き場のことです。
          画像は Wikimedia Commons など外部の画像配信元から読み込む場合があります。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">削除と問い合わせ</h3>
        <p className="mt-2 text-sm text-muted">
          設定画面から、保存データを JSON 形式で書き出したり、アプリ内の保存データを削除したりできます。
          JSON は、データを他の場所へ移すための読み書きしやすい形式です。
          削除対象は、表示名、好み、献立、在庫、常備品、固定枠、買い物リスト履歴です。
          認証アカウント自体の削除を希望する場合は、運営者に連絡してください。
          公開後は、GitHub repository の Issue またはアプリ内で案内する連絡先を問い合わせ窓口にします。
        </p>
      </section>
    </article>
  )
}
