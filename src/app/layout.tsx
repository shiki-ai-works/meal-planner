import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '完全栄養ランダム献立達人',
  description: '1週間分の献立を栄養バランスを考慮しながら自動生成するWebアプリ',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f7bff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
