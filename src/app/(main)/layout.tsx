import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: '献立', icon: '📅' },
  { href: '/shopping', label: '買い物', icon: '🛒' },
  { href: '/inventory', label: '在庫', icon: '🗄️' },
  { href: '/settings', label: '設定', icon: '⚙️' },
]

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <main className="flex-1 pb-20">{children}</main>

      {/* ボトムナビゲーション（スマホファースト） */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--card-border)] z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-3 px-4 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
