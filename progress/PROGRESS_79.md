# PROGRESS_79

> **check への画像 URL workflow 組み込み** — 2026-05-25

前回、`recipe-images:workflow` は対象ファイルの場所まで表示するようになった。今回は、その診断を標準検査 `npm run check` に組み込み、画像 URL 作業の入口が壊れていないことも毎回確認できるようにした。

## やったこと

### Step 1: `npm run check` に workflow 診断を追加

`package.json` の `check` を次の順にした。

```text
setup:doctor:test
recipe-images:workflow
typecheck
lint
build
```

`recipe-images:workflow` は診断なので、actual manifest が未作成でも次の手順を表示して成功する。

### Step 2: README を更新

検査説明に、`check` が画像 URL workflow 診断も含むことを追記した。

個別コマンド一覧にも `npm run recipe-images:workflow` を追加した。

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_79` へ進めた。

## 確認したこと

- `npm run check` が workflow 診断込みで通る
- workflow は actual manifest 未作成状態を表示し、次の手順を案内する
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass（Supabase setup 画面とデモ導線を確認）

## 変更ファイル

- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_79.md`
