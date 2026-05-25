# PROGRESS_82

> **画像 URL workflow status 追加** — 2026-05-25

前回、workflow JSON がきれいに読めることを自己検査に入れた。今回はその JSON と人間向け workflow に、現在地を表す `status` を追加した。地図に道順だけでなく「いま橋の手前にいる」と書くようなものだ。

## やったこと

### Step 1: workflow status を追加

`scripts/generate-recipe-image-sql.mjs` に `buildActualWorkflowStatus()` を追加した。

主な状態コード:

- `missing-actual-manifest`
- `blocked-by-errors`
- `collecting-image-urls`
- `needs-warning-review`
- `ready-to-generate-migration`
- `migration-outdated`
- `ready-to-apply-migration`

`recipe-images:workflow` の人間向け表示と、`recipe-images:workflow:json` の JSON の両方に同じ `status` を出す。

### Step 2: 自己検査を更新

`scripts/generate-recipe-image-sql.test.mjs` で次を確認するようにした。

- actual manifest 不在時は `missing-actual-manifest`
- actual manifest が完成し migration 未生成なら `ready-to-generate-migration`
- 人間向け workflow にも `status` が出る

### Step 3: README / ROADMAP を更新

README に主な `status` の意味を追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_82` へ進めた。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run --silent recipe-images:workflow:json` が `status` を含む JSON を出す
- `node scripts\generate-recipe-image-sql.mjs --workflow` が人間向け `status` を出す
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
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_82.md`
