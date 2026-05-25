# 超献立プランナー 開発進捗 #57

> **Supabase env 仮値検出** — 2026-05-25

`.env.example` を `.env.local` に写しただけだと、値は「ある」。けれど、それは本物の鍵ではない。今回は、空欄だけでなく仮値や URL 形式の誤りも setup 画面で見分けられるようにした。

---

## 何をやったか

### Step 1: Supabase env issue を追加

変更:

- `src/lib/supabase/env.ts`

追加:

- `SupabaseEnvIssue`
- `getSupabaseEnvIssues()`
- 仮 URL / 仮 key の判定
- Project URL の形式チェック

`hasSupabaseEnv()` は、単に値があるかではなく、issue が無いかを見るようにした。これで `.env.example` の仮値のままでは、ログイン前に `/setup` へ戻る。

### Step 2: setup 画面に `SETUP CHECK` を追加

変更:

- `src/app/setup/page.tsx`

状態:

- `SETUP REQUIRED`: 値が不足している
- `SETUP CHECK`: 値はあるが、仮値または形式不正
- `SETUP READY`: 必要な値が揃っている

確認が必要な値は、キー名と理由を並べて表示する。

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

`.env.example` の仮値のままでは接続済み扱いにならないことを追記した。

---

## 検証

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
$env:NEXT_PUBLIC_SUPABASE_URL='your-supabase-project-url'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='your-supabase-anon-key'; npm.cmd run build
$env:NEXT_PUBLIC_SUPABASE_URL='not-a-url'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='configured-anon-key'; npm.cmd run build
$env:NEXT_PUBLIC_SUPABASE_URL='https://configured-example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='configured-anon-key'; npm.cmd run build
git diff --check
```

ブラウザ確認:

```text
http://localhost:3000/setup
```

確認すること:

- 未設定時は `SETUP REQUIRED`
- 仮値 build では `SETUP CHECK`
- URL 不正 build でも `SETUP CHECK`
- 設定済み相当 build では `SETUP READY`
- 未設定時のブラウザでは不足キーとデモ導線が表示される

---

## 変更ファイル

- `src/lib/supabase/env.ts`
- `src/app/setup/page.tsx`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_57.md`

---

## 次にやること

### 1. 本物の `.env.local` で SETUP READY を確認する

Supabase Dashboard の Project URL と publishable key / legacy anon key を入れて、`/setup` が READY になることを確認する。

### 2. ログイン / 新規登録を実データで確認する

実 Supabase 接続後に `/login` と `/signup` を通し、`/dashboard` へ進めるか確認する。

### 3. 画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL 作業と migration 生成へ進む。
