# 超献立プランナー 開発進捗 #20

> **毎週固定の一覧・解除 UI** — 2026-05-24

PROGRESS_19 で `毎週固定` を登録できるようにした。今回は、その固定を見える場所に置き、不要になった時に解除できるようにした。鍵を掛ける術だけでは、いずれ扉が牢になる。故に、鍵を外す術も同じ棚に置いた。

---

## 何をやったか

### Step 1: 設定画面で毎週固定を取得

変更:

- `src/app/(main)/settings/page.tsx`

追加内容:

- `locked_meals` を現在ユーザー分だけ取得
- レシピ名表示用に `recipes` の `id, name` を取得
- 設定画面へ毎週固定管理コンポーネントを追加

`locked_meals` は Supabase の RLS、つまり本人の行だけを通す番人に守られている。

### Step 2: 毎週固定の一覧・解除 UI を追加

追加:

- `src/app/(main)/settings/WeeklyLocksClient.tsx`

追加内容:

- 曜日・朝昼夜・レシピ名を一覧表示
- `解除` ボタンで `locked_meals` から削除
- 削除は先に画面から消して、失敗時だけ戻す楽観更新
- 解除後に `router.refresh()` でサーバー側の表示も再取得

楽観更新とは、保存が成功すると見込んで先に画面を動かす手法だ。手紙を出した瞬間に机の上から封筒を片付けるようなものだが、配達に失敗したら戻す。

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

- `git diff --check` は CRLF/LF の予告警告のみで、空白エラーは無し
- Codex Browser で `http://127.0.0.1:3000/settings` を確認しようとしたが、`ERR_CONNECTION_REFUSED` で接続できなかった
- `.env.local` が無いため、本物の Supabase データでの解除確認は未実施

---

## 変更ファイル

- `src/app/(main)/settings/page.tsx`
- `src/app/(main)/settings/WeeklyLocksClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_20.md`

---

## 次にやること

### 1. 実データ確認

`.env.local` を用意した環境で以下を確認する。

- `毎週固定` 登録後に設定画面へ表示されること
- `解除` で `locked_meals` から削除されること
- 解除後の献立生成で固定枠が外れること

### 2. 毎週固定の編集 UI

解除はできるようになったが、既存枠のレシピ差し替えや外食固定への変更は未着手。

### 3. 画像 URL 投入

引き続き `007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
