# 公開デプロイ手順

最終更新: 2026-05-25

このアプリは Next.js の通常サーバー機能、Supabase Auth、Supabase Database を使います。静的 hosting ではなく、Next.js に対応した hosting を使います。hosting は、アプリをインターネット上で動かす置き場のことです。

## 事前確認

```powershell
npm run check
npm run e2e:public
```

`e2e:public` は公開前の主要導線を確認します。E2E は end-to-end の略で、入口から出口までをまとめて見る検査です。

## 本番 Supabase

1. Supabase Dashboard で本番 project を作ります。
2. SQL Editor で migration を番号順に適用します。

```text
001_initial_schema.sql
002_seed_recipes.sql
004_user_targets.sql
005_detailed_recipes.sql
006_detailed_existing_recipes.sql
007_recipe_images.sql
```

`003` は過去に別途適用済みとして扱われています。新しい本番 project では、`meal_plans` の `user_id, week_start_date` unique 制約が入っているか確認してください。

3. `Authentication > URL Configuration` で公開 URL を設定します。

```text
Site URL: https://<your-production-domain>
Redirect URLs:
- https://<your-production-domain>/**
- http://localhost:3000/**
```

4. `Settings > API Keys` から Project URL と publishable key、または legacy anon key を控えます。

公開環境変数に入れるのは次だけです。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

secret key や service_role key は、ブラウザへ公開される環境変数へ入れません。

## Vercel デプロイ

Vercel は Next.js の verified adapter 対応先です。verified adapter は、Next.js 側の互換性検査を通す対象として扱われる adapter のことです。

1. Vercel CLI にログインします。

```powershell
npx vercel login
```

2. project を紐づけます。

```powershell
npx vercel link
```

3. 本番環境変数を入れます。

```powershell
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

4. 本番へ deploy します。

```powershell
npx vercel --prod
```

CLI ではなく GitHub 連携で deploy する場合は、Vercel Dashboard で `shiki-ai-works/meal-planner` を import し、同じ環境変数を Production に設定します。

## 公開後確認

公開 URL が決まったら、次を実行します。

```powershell
$env:E2E_BASE_URL='https://<your-production-domain>'
node scripts/e2e-public-flow.mjs
```

次のページをブラウザでも確認します。

- `/setup`
- `/demo`
- `/legal`
- `/legal/terms`
- `/legal/privacy`
- `/legal/attributions`
- `/signup`

## 2026-05-25 の CLI 試行結果

- `npx vercel --version` -> `54.4.1`
- `npx supabase --version` -> `2.101.0`
- `npx supabase projects list` -> `SUPABASE_ACCESS_TOKEN` が無いため停止
- `npx vercel whoami` -> 既存 credential が無く login flow に入り停止

本番 project 作成と deploy 実行には、Supabase access token または CLI login、Vercel login または `VERCEL_TOKEN` が必要です。
