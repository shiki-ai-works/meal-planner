# 献立プランナー 開発進捗 #62

> **通常 API 503 の setup status 共通化** — 2026-05-25

PROGRESS_61 で Supabase setup status を `getSupabaseSetupStatus()` にまとめた。今回は、その helper を middleware の通常 API 503 にも使わせた。診断 API だけが詳しく、通常 API が古い言葉で答えるのは片手落ちだ。橋の両端に同じ標識を立てる。

---

## 何をやったか

### Step 1: middleware の env 判定を setup status helper へ変更

変更:

- `src/lib/supabase/middleware.ts`

以前は middleware が `getSupabaseEnvIssues()` を直接読み、API 503 では `issues` と `setupPath` だけを返していた。今は `getSupabaseSetupStatus()` を読み、`ok/status/issues/missingKeys/setupPath` を同じ形で返す。

### Step 2: 通常 API の 503 JSON を詳しくする

Supabase 未設定で `/api/generate-plan` などを呼ぶと、次のような形になる。

```json
{
  "error": "Supabase environment variables are not configured",
  "ok": false,
  "status": "required",
  "issues": [],
  "missingKeys": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "setupPath": "/setup"
}
```

画面ではなく API を叩いた時も、何を直すべきか機械的に読める。

### Step 3: redirect 先も helper の `setupPath` へ寄せる

Supabase 未設定で非公開ページへ入った時の redirect 先も、固定文字列ではなく `supabaseSetupStatus.setupPath` を使うようにした。今は `/setup` だが、後で変える時の火種を減らした。

---

## 検証

実施:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

API / ブラウザ確認:

```text
http://localhost:3000/api/setup-status
http://localhost:3000/api/generate-plan
http://localhost:3000/setup
```

確認すること:

- `/api/setup-status` が `status` と `missingKeys` を返す
- Supabase 未設定時の通常 API 503 も `status` と `missingKeys` を返す
- `/setup` が従来どおり `SETUP REQUIRED` と診断導線を表示する
- build / lint / typecheck が通る

確認結果:

```json
{
  "error": "Supabase environment variables are not configured",
  "ok": false,
  "status": "required",
  "missingKeys": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "setupPath": "/setup"
}
```

ブラウザ確認では `/setup` に `SETUP REQUIRED` と診断導線が表示され、`/api/setup-status` も同じ `status` / `missingKeys` を返した。

---

## 変更ファイル

- `src/lib/supabase/middleware.ts`
- `ROADMAP.md`
- `progress/PROGRESS_62.md`

---

## 次にやること

### 1. 本物の `.env.local` で `ready` 確認

Supabase Dashboard の値を入れ、`/setup` と `/api/setup-status` の両方が `ready` になることを確認する。

### 2. 実データ画面のブラウザ確認

`/dashboard`、`/recipes`、`/settings`、`/shopping` を Supabase 接続後の実データで確認する。

### 3. レシピ画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL の収集と migration 生成へ進む。
