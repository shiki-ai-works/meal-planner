import type { Metadata } from 'next'
import { APP_NAME, imageAttributions } from '@/lib/legal'

export const metadata: Metadata = {
  title: `画像クレジット | ${APP_NAME}`,
}

const fitLabel = {
  exact: '料理そのもの',
  close: '近い料理',
  representative: '代表イメージ',
}

export default function AttributionsPage() {
  return (
    <article className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-bold text-accent">ATTRIBUTIONS</p>
        <h2 className="mt-1 text-2xl font-bold">画像クレジット</h2>
        <p className="mt-2 text-sm text-muted">
          画像の作者、ライセンス、出典ページをまとめています。出典ページの表示が変わっている場合は、
          そのページの最新情報を優先してください。
        </p>
      </header>

      <section className="grid gap-3">
        {imageAttributions.map((item) => (
          <div key={`${item.recipe}-${item.sourcePageUrl}`} className="hud-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold">{item.recipe}</h3>
                <p className="mt-1 text-xs text-muted">
                  {item.author} / {item.license}
                </p>
              </div>
              <span className="w-fit rounded border border-card-border bg-background px-2 py-1 text-[10px] font-bold text-muted">
                {fitLabel[item.fit]}
              </span>
            </div>
            <a
              href={item.sourcePageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block break-all text-xs font-bold text-accent hover:underline"
            >
              {item.sourcePageUrl}
            </a>
          </div>
        ))}
      </section>
    </article>
  )
}
