# 超献立プランナー 開発進捗 #22

> **Supabase 未設定時の起動案内** — 2026-05-24

開発サーバー自体は起動できたが、`.env.local` が無いため Supabase クライアント生成で Runtime Error になっていた。今回は、鍵が無い時に壊れた画面を見せるのではなく、`/setup` へ誘導して不足している値を表示するようにした。

---

## 何をやったか

### Step 1: Supabase 環境変数ヘルパーを追加

追加:

- `src/lib/supabase/env.ts`

追加内容:

- `getSupabaseEnv`
- `hasSupabaseEnv`
- `getMissingSupabaseEnvKeys`

`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を一箇所で判定する。水源を確かめる井戸番のような役だ。

### Step 2: Proxy で未設定時の流れを制御

変更:

- `src/lib/supabase/middleware.ts`

変更内容:

- Supabase env が無い時はページアクセスを `/setup` へリダイレクト
- API アクセスは 503 JSON を返す
- `/setup` 自体は通す

これで `/settings` や `/dashboard` へ行っても Runtime Error ではなく、セットアップ案内へ流れる。

### Step 3: セットアップ画面を追加

追加:

- `src/app/setup/page.tsx`

追加内容:

- 不足している env キーを表示
- `.env.local` の最小形を表示
- 値を入れた後は dev server 再起動が必要だと案内

### Step 4: Supabase client のエラーを明示化

変更:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`

変更内容:

- env が無い時は Supabase ライブラリ内部の曖昧なエラーではなく、アプリ側で明示的にエラーを投げる

---

## 起動確認

起動:

```powershell
npm run dev
```

確認:

- `http://localhost:3000/settings` にアクセス
- `http://localhost:3000/setup` へ誘導される
- `Supabase 接続設定が必要です` が表示される
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が不足値として表示される

---

## 検査

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

補足:

- 起動中の dev server が `.next` 内ログを掴むと `next build` が失敗するため、開発サーバーログは `dev-server.log` / `dev-server.err.log` に逃がした
- `git diff --check` は CRLF/LF の予告警告のみで、空白エラーは無し

---

## 変更ファイル

- `src/lib/supabase/env.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/app/setup/page.tsx`
- `.gitignore`
- `scripts/start-dev.cmd`
- `ROADMAP.md`
- `progress/PROGRESS_22.md`

---

## 次にやること

### 1. `.env.local` を入れて実データ確認

`.env.local` に以下を入れて dev server を再起動する。

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2. 認証フロー確認

ログイン、新規登録、`/dashboard`、`/recipes`、`/settings` の流れを実データで確認する。

### 3. 画像 URL 投入

引き続き `007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
