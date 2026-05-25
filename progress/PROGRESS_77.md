# PROGRESS_77

> **画像 URL workflow 入口整理** — 2026-05-25

画像 URL 投入の道具は育ってきたが、最初に見るべき診断コマンドが `actual-workflow` という少し奥まった名前だった。今回は入口を `recipe-images:workflow` として前に出し、README とツールの案内も同じ名前へ揃えた。

## やったこと

### Step 1: `recipe-images:workflow` を追加

`package.json` に次を追加した。

```powershell
npm.cmd run recipe-images:workflow
```

actual manifest、todo checklist、migration SQL の有無と、次に実行すべき command を表示する。

### Step 2: workflow の次アクション表示を更新

actual manifest が無い時の案内を、次回確認用に `recipe-images:workflow` を使う表記へ変更した。

### Step 3: README / ROADMAP を更新

README の画像 URL 手順で、まず workflow を見る流れを明記した。

ROADMAP の完了済み項目、Now、関連ドキュメントも `PROGRESS_77` へ進めた。

## 確認したこと

- `npm run recipe-images:workflow` が通る
- actual manifest が無い現在の状態で、`init-actual` -> URL 入力 -> workflow 再確認の順に案内される
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

- `package.json`
- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_77.md`
