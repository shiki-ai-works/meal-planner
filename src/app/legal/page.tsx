import Link from 'next/link'
import { LEGAL_LAST_UPDATED, legalLinks } from '@/lib/legal'

export default function LegalIndexPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold text-accent">LEGAL INDEX</p>
        <h2 className="mt-1 text-xl font-bold">公開前に確認しておくこと</h2>
        <p className="mt-2 text-sm text-muted">
          利用者が安心して使えるように、利用条件、個人情報の扱い、画像の出典をまとめています。
          最終更新日は {LEGAL_LAST_UPDATED} です。
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {legalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hud-border bg-card p-4 hover:border-accent"
          >
            <span className="text-sm font-bold">{link.label}</span>
            <span className="mt-2 block text-xs text-muted">内容を確認する</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
