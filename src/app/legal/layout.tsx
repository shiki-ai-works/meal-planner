import Link from 'next/link'
import { APP_NAME, legalLinks } from '@/lib/legal'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-card-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/demo" className="text-xs font-bold text-accent hover:underline">
              {APP_NAME}
            </Link>
            <h1 className="mt-1 text-2xl font-bold">公開情報</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded border border-card-border bg-card px-3 py-2 font-bold text-muted hover:border-accent hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  )
}
