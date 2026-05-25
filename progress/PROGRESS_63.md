# 献立プランナー 開発進捗 #63

> **setup status JSON の no-store 化** — 2026-05-25

PROGRESS_61 と 62 で、Supabase setup status の JSON 形を揃えた。今回は、その診断 JSON に `Cache-Control: no-store` を付けた。`Cache-Control` は「この応答を保存してよいか」を伝える HTTP header（通信の札）だ。鍵の設定状態は変わり得るので、古い札を後生大事に持たれては困る。

---

## 何をやったか

### Step 1: cache header の値を共通化

変更:

- `src/lib/supabase/env.ts`

追加:

```ts
export const SUPABASE_SETUP_STATUS_CACHE_CONTROL = 'no-store'
```

診断 JSON の cache 方針を一つの定数にした。

### Step 2: `/api/setup-status` に no-store を付与

変更:

- `src/app/api/setup-status/route.ts`

`NextResponse.json()` の `headers` に `Cache-Control: no-store` を追加した。これで setup status API の結果がブラウザや中間層に保存されにくくなる。

### Step 3: 通常 API の Supabase 未設定 503 にも no-store を付与

変更:

- `src/lib/supabase/middleware.ts`

Supabase 未設定時に `/api/generate-plan` などが返す 503 JSON にも同じ `Cache-Control: no-store` を付けた。診断 API と通常 API の失敗応答が、同じ cache 方針になる。

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

- `/api/setup-status` が `Cache-Control: no-store` を返す
- Supabase 未設定時の通常 API 503 も `Cache-Control: no-store` を返す
- `/setup` が従来どおり `SETUP REQUIRED` と診断導線を表示する
- build / lint / typecheck が通る

確認結果:

```json
{
  "setupStatus": {
    "statusCode": 200,
    "cacheControl": "no-store"
  },
  "generatePlan": {
    "statusCode": 503,
    "cacheControl": "no-store"
  }
}
```

ブラウザ確認では `/setup` に `SETUP REQUIRED` と診断導線が表示され、`/api/setup-status` も `status: "required"` と `missingKeys` を返した。

---

## 変更ファイル

- `src/lib/supabase/env.ts`
- `src/app/api/setup-status/route.ts`
- `src/lib/supabase/middleware.ts`
- `ROADMAP.md`
- `progress/PROGRESS_63.md`

---

## 次にやること

### 1. 本物の `.env.local` で `ready` 確認

Supabase Dashboard の値を入れ、`/setup` と `/api/setup-status` の両方が `ready` になることを確認する。

### 2. 実データ画面のブラウザ確認

`/dashboard`、`/recipes`、`/settings`、`/shopping` を Supabase 接続後の実データで確認する。

### 3. レシピ画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL の収集と migration 生成へ進む。
