# PROGRESS_84

> **画像 URL workflow nextActionItems 追加** — 2026-05-25

前回、workflow の `status` を主要分岐まで自己検査した。今回は、次に何をするかを文章だけでなく構造化された `nextActionItems` として返すようにした。道案内を声で聞くだけでなく、地図上の曲がり角にも印を付けるようなものだ。

## やったこと

### Step 1: 構造化 action を追加

`scripts/generate-recipe-image-sql.mjs` に次の helper を追加した。

- `buildCommandAction()`
- `buildManualAction()`
- `formatActionLabels()`
- `buildActualWorkflowNextActionItems()`

workflow JSON は従来の `nextActions` を残したまま、`nextActionItems` も返す。

`nextActionItems` には `id` / `type` / `label` / `command` / `path` などが入る。`command` は実行できるコマンド、`manual` は人が編集・確認する作業の目印だ。

### Step 2: 自己検査を更新

`scripts/generate-recipe-image-sql.test.mjs` で次を確認するようにした。

- actual manifest 不在時の `create-actual-manifest`
- URL 未入力時の `fill-image-urls`
- migration 生成時の `generate-actual-migration`
- migration 適用準備時の `apply-actual-migration`

### Step 3: README / ROADMAP を更新

README に `nextActionItems` の意味を追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_84` へ進めた。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run --silent recipe-images:workflow:json` が `nextActionItems` を含む JSON を出す
- `npm.cmd run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run --silent recipe-images:workflow:json
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run --silent recipe-images:workflow:json` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_84.md`
