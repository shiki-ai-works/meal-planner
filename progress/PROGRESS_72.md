# PROGRESS_72

> **Supabase 診断 JSON schema version 追加** — 2026-05-25

診断 JSON は人にも機械にも読まれる。今回は `/api/setup-status` と `setup:doctor:json` の両方に `diagnosticSchemaVersion` と `requiredKeys` を追加した。地図に年号と凡例を付けるようなものだ。

## やったこと

### Step 1: アプリ側の setup status に schema version を追加

`src/lib/supabase/env.ts` に次を追加した。

```ts
SUPABASE_SETUP_DIAGNOSTIC_SCHEMA_VERSION = 1
SUPABASE_REQUIRED_ENV_KEYS
```

`getSupabaseSetupStatus()` の返却 JSON に次が含まれるようになった。

```json
{
  "diagnosticSchemaVersion": 1,
  "requiredKeys": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ]
}
```

`/api/setup-status` はこの helper を返しているため、API 側にも同じ項目が出る。

### Step 2: setup doctor JSON にも同じ項目を追加

`scripts/check-supabase-env.mjs` の JSON 出力にも `diagnosticSchemaVersion` と `requiredKeys` を追加した。

鍵の実値は引き続き出さない。

### Step 3: self-test と README を更新

`scripts/check-supabase-env.test.mjs` で、schema version と required keys を検証するようにした。

README には、JSON に `diagnosticSchemaVersion` が入ることを追記した。

## 確認したこと

- `setup:doctor:json` に `diagnosticSchemaVersion: 1` が出る
- `setup:doctor:json` に `requiredKeys` が出る
- `/api/setup-status` に `diagnosticSchemaVersion: 1` と `requiredKeys` が出る
- `npm run check` が通る

## 検証コマンド

```powershell
npm.cmd run --silent setup:doctor:json
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run --silent setup:doctor:json` -> pass（`diagnosticSchemaVersion: 1` と `requiredKeys` を確認）
- `/api/setup-status` ブラウザ確認 -> pass（`diagnosticSchemaVersion: 1`、`requiredKeys`、`missingKeys`、`setupPath` を確認）
- `/setup` ブラウザ確認 -> pass（`SETUP REQUIRED` と診断 JSON 導線を確認）
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）

## 変更ファイル

- `src/lib/supabase/env.ts`
- `scripts/check-supabase-env.mjs`
- `scripts/check-supabase-env.test.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_72.md`
