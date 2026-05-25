# 公開デプロイ手順

最終更新: 2026-05-26

このアプリは Next.js の通常サーバー機能、Supabase Auth、Supabase Database を使います。静的 hosting ではなく、Next.js に対応した hosting を使います。hosting は、アプリをインターネット上で動かす置き場のことです。

## 事前確認

```powershell
npm run release:check
```

`release:check` は通常検査、strict 画像出典メモ検査、公開前の主要導線 E2E をまとめて実行します。E2E は end-to-end の略で、入口から出口までをまとめて見る検査です。通常検査には、README と `PORTFOLIO.md` のスクリーンショット参照が壊れていないかを見る `portfolio:check`、Markdown 文書のローカルリンク切れを見る `docs:links`、日本語文書の文字化け断片を見る `docs:mojibake`、最新進捗が ROADMAP に載っているかを見る `docs:progress-index` も含まれます。`portfolio:check` は参照先が存在し、拡張子どおりの JPEG / PNG として読めるかを確認します。`docs:links` は README / PORTFOLIO / ROADMAP / NEXT_CHAT_HANDOFF / DEPLOYMENT のファイル参照が実在するかを確認します。`docs:mojibake` は UTF-8 の読み違えで生まれやすい断片が Markdown に混ざっていないか確認します。`docs:progress-index` は最新の `progress/PROGRESS_NN.md` が ROADMAP の最終更新と関連ドキュメントに反映されているか確認します。公開前 E2E には `/demo?section=shopping` と `/demo?recipe=demo-natto-rice` も含まれるので、README で案内しているデモの深いリンクも確認できます。strict は警告も失敗として扱う確認で、作者名やライセンスが placeholder のまま戻った時に公開前で止めるための網です。`check` の build 結果を E2E で再利用するため、同じ build を二度走らせません。画像出典メモ検査には、ローカル作業用の `supabase/recipe-images.sources.json` が必要です。build 済み E2E の `e2e:public:run` は、ローカル検査時に `.next/BUILD_ID` が無ければ先に build するよう案内します。この guard は `npm run e2e:public:test` でも自己検査されます。

画像出典の warning 対象を source page URL つきで見直す場合は、次を使います。source page URL は出典ページの住所で、作者名やライセンスを確認する入口です。

```powershell
npm run recipe-images:sources-report
```

画像出典の再確認メモだけを単独で強めに確認する場合は、次を使います。

```powershell
npm run recipe-images:sources-check:strict
```

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

このリポジトリには、本番 deploy と公開後 E2E をまとめて実行する script もあります。script は小さな手順書つきの自動係で、`.env.local` か shell の環境変数を読みます。

```powershell
npm run deploy:production
```

必要な値は次です。token は CLI に渡す認証用の鍵です。Git には commit しません。

```env
VERCEL_TOKEN=...
VERCEL_PROJECT_ID=...
# team project の場合だけ
VERCEL_ORG_ID=...
```

`.vercel/project.json` が無い場合は、`VERCEL_PROJECT_ID` または `VERCEL_PROJECT_NAME` を設定してください。この script は、Vercel CLI が日本語の端末名を HTTP header に入れて失敗する場合にも、実行中だけ ASCII の端末名へ置き換えます。HTTP header は、通信時にソフトや条件を相手へ伝える短い札のようなものです。

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
npm run e2e:public:run
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
