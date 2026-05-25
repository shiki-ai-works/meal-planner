# PROGRESS_90

> **公開準備と E2E 導線** — 2026-05-25

公開に向けて、注意書き、権利表示、公開前 E2E、デプロイ手順を整えた。店先に看板を出す前に、入口の案内と避難経路をそろえるような作業だよ。

## やったこと

### Step 1: 公開向け legal ページを追加

- `/legal`
- `/legal/terms`
- `/legal/privacy`
- `/legal/attributions`

利用規約、栄養・アレルギー注意書き、プライバシー、画像クレジットをログイン前に確認できるようにした。

### Step 2: 導線を追加

- login / signup の下部に legal links を追加
- signup に利用規約とプライバシーポリシーの確認 checkbox を追加
- `/setup` と `/demo` と設定画面から公開情報へ進めるようにした
- middleware で `/legal` を公開 route として扱うようにした

### Step 3: E2E smoke test を追加

`scripts/e2e-public-flow.mjs` と `npm run e2e:public` を追加した。

確認対象:

- `/api/setup-status`
- `/setup`
- `/demo`
- `/legal`
- `/legal/terms`
- `/legal/privacy`
- `/legal/attributions`
- `/signup`（Supabase env が ready の場合）

### Step 4: デプロイ手順を追加

`DEPLOYMENT.md` を追加し、本番 Supabase、Vercel、公開後確認の手順をまとめた。

CLI 試行結果:

- `npx vercel --version` -> `54.4.1`
- `npx supabase --version` -> `2.101.0`
- `npx supabase projects list` -> `SUPABASE_ACCESS_TOKEN` が無いため停止
- `npx vercel whoami` -> 既存 credential が無く login flow に入り停止

## 確認したこと

- `npm.cmd run check` -> pass
- `npm.cmd run e2e:public` -> pass
- `git diff --check` -> pass（CRLF 変換警告のみ）
- Browser で `/legal/terms` と `/legal/attributions` を確認
- `public-e2e-legal-verify.png` を確認画像として保存

## 変更ファイル

- `DEPLOYMENT.md`
- `README.md`
- `ROADMAP.md`
- `package.json`
- `scripts/e2e-public-flow.mjs`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(main)/settings/page.tsx`
- `src/app/demo/DemoClient.tsx`
- `src/app/legal/*`
- `src/app/setup/page.tsx`
- `src/lib/legal.ts`
- `src/lib/supabase/middleware.ts`
