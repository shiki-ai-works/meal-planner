# 超献立プランナー 開発進捗 #55

> **setup 画面の設定済み導線** — 2026-05-25

`/setup` は Supabase の鍵が無い時には親切だったが、鍵が揃った後も「設定が必要です」と言い続けていた。玄関が開いたあとも門番が通せんぼするようなものなので、環境変数の状態に応じて表示を切り替えた。

---

## 何をやったか

### Step 1: 設定済み判定を追加

変更:

- `src/app/setup/page.tsx`

`getMissingSupabaseEnvKeys()` の結果から `isConfigured` を作り、必要な環境変数が揃っているかを画面上で判定する。

### Step 2: 見出しと本文を状態別に変更

未設定:

- `SETUP REQUIRED`
- `Supabase 接続設定が必要です`
- デモ画面への導線

設定済み:

- `SETUP READY`
- `Supabase 接続設定は揃っています`
- ログイン / ダッシュボードへの導線

### Step 3: 不足キー欄も状態別に変更

不足キーが無い時は「必要な環境変数は揃っています」と表示し、ログインへ進めることを明示した。

---

## 検証

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
$env:NEXT_PUBLIC_SUPABASE_URL='https://configured-example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='configured-anon-key'; npm.cmd run build
git diff --check
```

ブラウザ確認:

```text
http://localhost:3000/setup
```

確認すること:

- Supabase 未設定時に `SETUP REQUIRED` と不足キーが表示される
- デモ画面への導線が表示される
- Supabase 設定済み相当の build では `SETUP READY` とログイン / ダッシュボード導線になる

---

## 変更ファイル

- `src/app/setup/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_55.md`

---

## 次にやること

### 1. 実 `.env.local` で設定済み表示を確認する

本物の Supabase 値を入れた状態で `/setup` を開き、ログイン導線が見えることを確認する。

### 2. ログイン後の主要画面を実データで確認する

`/dashboard`、`/recipes`、`/settings`、`/shopping` を実 DB 接続で確認する。

### 3. 画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL 作業と migration 生成へ進む。
