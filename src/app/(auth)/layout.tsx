import Link from 'next/link'
import { legalLinks } from '@/lib/legal'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        {/* タイトルロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🍱</span>
            <h1
              className="app-title-shadow text-3xl font-bold leading-tight text-[var(--accent)]"
              data-title="完全栄養ランダム献立達人"
            >
              完全栄養ランダム献立達人
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            1週間の献立を栄養バランスよく自動生成
          </p>
        </div>
        {children}
        <nav className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-[var(--muted)]">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--accent)]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
