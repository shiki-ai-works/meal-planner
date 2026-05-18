export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        {/* タイトルロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🍱</span>
            <h1 className="text-2xl font-bold text-[var(--accent)] tracking-tight">
              超献立プランナー
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            1週間の献立を栄養バランスよく自動生成
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
