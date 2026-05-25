# 超献立プランナー 開発進捗 #56

> **setup 画面の利用可否ガイド** — 2026-05-25

Supabase 未設定時は `/login` へ直接進まず `/setup` に戻る。仕組みとしては正しいが、画面に「何なら今開けるのか」が無いと、利用者にはただ閉ざされた扉に見える。今回は `/setup` に、今すぐ開ける画面と鍵の設定後に使える画面を分けて示した。

---

## 何をやったか

### Step 1: 「いま開ける画面」セクションを追加

変更:

- `src/app/setup/page.tsx`

追加した案内:

- デモ画面は Supabase の鍵なしで開ける
- 献立、買い物、栄養、固定枠の見た目はデモで確認できる
- ログイン、新規登録、ダッシュボード、在庫、買い物リストは Supabase 接続後に実データで使う

### Step 2: 未設定 / 設定済みで表示を切り替え

未設定:

- 「鍵の設定後に利用可」
- `.env.local` を入れて開発サーバーを再起動する案内

設定済み:

- 「利用可」
- ログインへの導線

### Step 3: ROADMAP を更新

変更:

- `ROADMAP.md`

PROGRESS_56 として、setup 画面の利用可否ガイドを反映した。

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

- Supabase 未設定時に `SETUP REQUIRED` が表示される
- `今すぐ利用可` と `デモを見る` が表示される
- `鍵の設定後に利用可` と `.env.local` 再起動案内が表示される
- Supabase 設定済み相当の build では `利用可` とログイン導線が表示される

---

## 変更ファイル

- `src/app/setup/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_56.md`

---

## 次にやること

### 1. 実 `.env.local` でログイン導線を確認する

本物の Supabase 値を入れた状態で `/setup` を開き、ログインとダッシュボード導線を確認する。

### 2. ログイン後の主要画面を実データで確認する

`/dashboard`、`/recipes`、`/settings`、`/shopping` を実 DB 接続で確認する。

### 3. 画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL 作業と migration 生成へ進む。
