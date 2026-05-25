# 超献立プランナー 開発進捗 #58

> **Supabase env 判定の一元化** — 2026-05-25

PROGRESS_57 で env の仮値や不正 URL を見分けられるようにした。今回は、その判定を Supabase client 作成と middleware でも同じように使うよう整えた。判定する者が複数いるなら、同じ物差しを持たせるべきだ。

---

## 何をやったか

### Step 1: env assert を追加

変更:

- `src/lib/supabase/env.ts`

追加:

- `assertSupabaseEnvConfigured()`

`getSupabaseEnvIssues()` に issue があれば例外を投げる。browser / server の Supabase client 作成は、この assert を通すようにした。

### Step 2: middleware の env 読み取りを一元化

変更:

- `src/lib/supabase/middleware.ts`

これまで middleware は `process.env.NEXT_PUBLIC_SUPABASE_URL!` と `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` を直接読んでいた。今は `getSupabaseEnv()` を使うので、trim 済みの値で `createServerClient` に渡る。

### Step 3: API 503 に issue を含める

Supabase env に問題がある状態で `/api/...` にアクセスした場合、次を返す。

```json
{
  "error": "Supabase environment variables are not configured",
  "issues": [
    { "key": "NEXT_PUBLIC_SUPABASE_URL", "message": "Project URL が未設定です。" }
  ],
  "setupPath": "/setup"
}
```

画面ではなく API を叩いた時も、何を直せばよいか分かる。

---

## 検証

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
$env:NEXT_PUBLIC_SUPABASE_URL='your-supabase-project-url'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='your-supabase-anon-key'; npm.cmd run build
$env:NEXT_PUBLIC_SUPABASE_URL='https://configured-example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='configured-anon-key'; npm.cmd run build
git diff --check
```

API / ブラウザ確認:

```text
http://localhost:3000/api/generate-plan
http://localhost:3000/setup
```

確認すること:

- Supabase 未設定時の API 503 に `issues` と `setupPath` が含まれる
- `/setup` は未設定時に `SETUP REQUIRED` を表示
- 仮値 build でもビルドは通り、setup は `SETUP CHECK` として扱う
- 設定済み相当 build でもビルドは通る

---

## 変更ファイル

- `src/lib/supabase/env.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `ROADMAP.md`
- `progress/PROGRESS_58.md`

---

## 次にやること

### 1. 本物の `.env.local` でログインを確認する

Supabase Dashboard の値を入れて、`/setup` が READY になり、`/login` から進めることを確認する。

### 2. 実データ画面を確認する

`/dashboard`、`/recipes`、`/settings`、`/shopping` を実 DB 接続で確認する。

### 3. 画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL 作業と migration 生成へ進む。
