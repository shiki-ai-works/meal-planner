# PROGRESS_102

> **source notes attribution 確定** — 2026-05-25

出典 warning を追う道具がそろったので、今回は実際に 9 件の placeholder attribution を確定した。地図を作ったあと、ようやく道を歩いた感じだね。

## やったこと

### Step 1: Wikimedia Commons メタデータを確認

Wikimedia Commons の file page と API metadata で、author / license を確認した。

| Recipe | Author | License |
| --- | --- | --- |
| トースト＋目玉焼き＋サラダ | Joseph Gonzalez / miracletwentyone | CC0 1.0 |
| ヨーグルトパフェ | Personal Creations | CC BY 2.0 |
| 豚汁定食 | kina3 | CC BY 2.0 |
| パスタ ナポリタン | Irureta | CC BY-SA 3.0 |
| 蒸し鶏の冷やしうどん | N509FZ | CC BY-SA 4.0 |
| 親子丼 | Ocdp | CC0 1.0 |
| ぶり大根 | Ocdp | CC0 1.0 |
| バンバンジー（棒棒鶏） | Yumi Kimura | CC BY-SA 2.0 |
| 鶏とごろごろ野菜のクリームシチュー | Ocdp | CC0 1.0 |

### Step 2: legal attribution を更新

`src/lib/legal.ts` の `See Wikimedia Commons file page` を具体的な author / license に置き換えた。

### Step 3: source notes を更新

作業用ファイル `supabase/recipe-images.sources.json` も同じ author / license に更新した。

このファイルは `.gitignore` 対象だが、`sources-check` / `sources-check:strict` のローカル検証に使う。

### Step 4: demo lint を修正

`release:check` の途中で、`src/app/demo/DemoClient.tsx` の URL search params 同期が React lint に止められた。

URL search params の読み取りを `syncFromQuery` にまとめ、`useSearchParams` 依存なしで初回同期と戻る / 進む操作を扱う形にした。これで demo の `?section=` / `?recipe=` 表示を保ちつつ、lint を通せる。

### Step 5: demo の静的 fallback を追加

`e2e:public:run` で `/demo` の本番 HTML に `DEMO PREVIEW` が含まれず止まった。

期待値を弱めるのではなく、`src/app/demo/page.tsx` に Suspense fallback を追加し、JavaScript が読み込まれる前でも `DEMO PREVIEW` / `完全栄養ランダム献立達人` / `公開情報` が HTML に出るようにした。看板だけ先に立てて、店内の灯りがつくのを待てる形だね。

あわせて `scripts/e2e-public-flow.test.mjs` の fixture を、強化済みの `/legal/attributions` 期待値 `commons.wikimedia.org` に合わせた。

## 確認したこと

- `npm.cmd run recipe-images:sources-check` -> pass
- `npm.cmd run recipe-images:sources-check:strict` -> pass
- `npm.cmd run --silent recipe-images:sources-report:json` -> pass（`placeholderAttributionCount: 0`）
- `npm.cmd run recipe-images:workflow` -> pass（`placeholder attribution warnings: 0`）
- `npm.cmd run lint` -> pass
- `npm.cmd run typecheck` -> pass
- `npm.cmd run e2e:public:test` -> pass
- `npm.cmd run release:check` -> pass
- `http://localhost:3000/setup` -> Browser で表示確認（title: `完全栄養ランダム献立達人`、`Supabase` / `画像クレジット` 表示あり）

## 変更ファイル

- `src/lib/legal.ts`
- `src/app/demo/DemoClient.tsx`
- `src/app/demo/page.tsx`
- `scripts/e2e-public-flow.test.mjs`
- `.gitignore`
- `supabase/recipe-images.sources.json`（ignored work file）
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_102.md`
