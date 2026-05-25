# 献立プランナー 開発進捗 #61

> **Supabase setup status helper 共通化** — 2026-05-25

PROGRESS_59 で `/api/setup-status`、PROGRESS_60 で `/setup` の request 時描画を整えた。今回は、画面と API が別々に持っていた `required/check/ready` の判定を `getSupabaseSetupStatus()` にまとめた。判定は秤のようなものだ。一つの秤で量れば、朝市でも帳場でも同じ重さになる。

---

## 何をやったか

### Step 1: setup status の型と helper を追加

変更:

- `src/lib/supabase/env.ts`

追加:

- `SupabaseEnvKey`
- `SupabaseSetupStatus`
- `SupabaseSetupStatusResult`
- `getSupabaseSetupStatus()`

返す形:

```ts
{
  ok: boolean
  status: 'required' | 'check' | 'ready'
  issues: SupabaseEnvIssue[]
  missingKeys: SupabaseEnvKey[]
  setupPath: '/setup'
}
```

### Step 2: `/api/setup-status` を helper 利用へ変更

変更:

- `src/app/api/setup-status/route.ts`

API は `NextResponse.json(getSupabaseSetupStatus())` を返すだけにした。これで JSON の組み立て規則が `env.ts` に集まる。

### Step 3: `/setup` 画面も helper 利用へ変更

変更:

- `src/app/setup/page.tsx`

画面側も `getSupabaseSetupStatus()` から `ok/status/issues` を受け取るようにした。`SETUP CHECK` の判定も `setupState.status === 'check'` になり、API と同じ言葉で状態を見る。

---

## 検証

実施:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

ブラウザ / API 確認:

```text
http://localhost:3000/setup
http://localhost:3000/api/setup-status
```

確認すること:

- `/setup` が `SETUP REQUIRED` と診断 JSON 導線を表示する
- `/api/setup-status` が `status`, `issues`, `missingKeys`, `setupPath` を返す
- build / lint / typecheck が通る

確認結果:

```json
{
  "ok": false,
  "status": "required",
  "missingKeys": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "setupPath": "/setup"
}
```

ブラウザ確認では `/setup` に `SETUP REQUIRED`、`/demo` 導線、`/api/setup-status` 導線が表示された。

---

## 変更ファイル

- `src/lib/supabase/env.ts`
- `src/app/api/setup-status/route.ts`
- `src/app/setup/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_61.md`

---

## 次にやること

### 1. 本物の `.env.local` で `ready` 確認

Supabase Dashboard の値を入れ、`/setup` と `/api/setup-status` の両方が `ready` になることを確認する。

### 2. 実データ画面のブラウザ確認

`/dashboard`、`/recipes`、`/settings`、`/shopping` を Supabase 接続後の実データで確認する。

### 3. レシピ画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL の収集と migration 生成へ進む。
