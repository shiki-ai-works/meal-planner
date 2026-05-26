import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isUserOnboarded } from '@/lib/onboarding'

const navItems = [
  { href: '/dashboard', label: '献立', icon: '📅' },
  { href: '/recipes', label: 'レシピ', icon: '🍱' },
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

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!isUserOnboarded(profile)) {
    redirect('/setup')
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
              className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-3 text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
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
