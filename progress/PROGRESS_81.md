# PROGRESS_81

> **画像 URL workflow JSON 自己検査** — 2026-05-25

前回、画像 URL workflow を JSON でも出せるようにした。今回は actual manifest が存在する場合にも、その JSON が余計な表示を混ぜずに読めることを固めた。井戸水を汲むなら、桶そのものも清くしておく、という話だ。

## やったこと

### Step 1: workflow JSON の混入ログを除去

`buildActualWorkflow()` の中で人間向けの summary を `console.log` していた箇所を外した。

これで `--workflow-json` は actual manifest が存在する場合でも、純粋な JSON だけを標準出力へ出す。

### Step 2: workflow 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` を追加した。

検査内容:

- actual manifest が無い時の `--workflow-json`
- actual manifest がある時の `--workflow-json`
- 人間向け `--workflow` の見出しと summary
- `--workflow` と `--workflow-json` の同時指定エラー

### Step 3: 標準検査へ組み込み

`package.json` に `recipe-images:workflow:test` を追加し、`npm run check` に組み込んだ。

README と ROADMAP も更新し、自己検査の使い道を追記した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run --silent recipe-images:workflow:json` が JSON を出す
- `node scripts\generate-recipe-image-sql.mjs --workflow` が人間向け表示を出す
- `npm.cmd run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run --silent recipe-images:workflow:json
node scripts\generate-recipe-image-sql.mjs --workflow
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run --silent recipe-images:workflow:json` -> pass
- `node scripts\generate-recipe-image-sql.mjs --workflow` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_81.md`
