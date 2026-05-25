# PROGRESS_78

> **画像 URL workflow パス表示** — 2026-05-25

前回、画像 URL 作業の入口として `recipe-images:workflow` を追加した。今回はその診断表示に、対象ファイルの場所も添えた。状態だけでなく、次に触る紙束の棚番まで見えるようにした形だ。

## やったこと

### Step 1: workflow の状態表示にパスを追加

`recipe-images:workflow` の次の表示に、対象ファイルのパスを添えた。

```text
actual manifest
todo checklist
migration SQL
```

### Step 2: README を更新

workflow の説明に、対象ファイルの場所も表示されることを追記した。

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_78` へ進めた。

## 確認したこと

- `npm run recipe-images:workflow` が通る
- workflow の出力に次のパスが出る
  - `supabase/recipe-images.actual.json`
  - `supabase/recipe-images.todo.md`
  - `supabase/migrations/007_recipe_images.sql`
- `npm run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass（Supabase setup 画面とデモ導線を確認）

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_78.md`
