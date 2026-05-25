import type { Metadata } from 'next'
import { APP_NAME, LEGAL_LAST_UPDATED } from '@/lib/legal'

export const metadata: Metadata = {
  title: `利用規約 | ${APP_NAME}`,
}

export default function TermsPage() {
  return (
    <article className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-bold text-accent">TERMS</p>
        <h2 className="mt-1 text-2xl font-bold">利用規約と注意書き</h2>
        <p className="mt-2 text-xs text-muted">最終更新: {LEGAL_LAST_UPDATED}</p>
      </header>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">サービスの位置づけ</h3>
        <p className="mt-2 text-sm text-muted">
          {APP_NAME} は、日々の献立作りを軽くするための支援ツールです。
          表示される献立、栄養量、買い物リストは目安であり、医療・栄養指導・診断の代わりではありません。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">アレルギーと安全確認</h3>
        <p className="mt-2 text-sm text-muted">
          アレルギーや持病、妊娠中、食事制限がある場合は、必ず利用者自身で材料表示と調理内容を確認してください。
          入力した苦手食材やアレルギー情報をもとに避ける努力はしますが、安全性を完全には保証しません。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">画像と第三者コンテンツ</h3>
        <p className="mt-2 text-sm text-muted">
          レシピ画像の一部は Wikimedia Commons など外部の素材を参照します。
          画像ごとの作者・ライセンス・出典は画像クレジットに表示します。
          外部素材の条件は、それぞれの出典ページが優先されます。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">禁止事項</h3>
        <p className="mt-2 text-sm text-muted">
          不正アクセス、過度な自動アクセス、他人の情報の登録、サービス運営を妨げる行為、
          法令や公序良俗に反する使い方を禁止します。
        </p>
      </section>

      <section className="hud-border bg-card p-5">
        <h3 className="text-sm font-bold">免責</h3>
        <p className="mt-2 text-sm text-muted">
          献立や栄養の結果、食材の購入、調理、健康状態に関する最終判断は利用者自身で行ってください。
          可能な範囲で品質を保ちますが、常に完全で誤りがないことは保証しません。
        </p>
      </section>
    </article>
  )
}
