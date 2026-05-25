# PROGRESS_86

> **画像 URL workflow schema 出力** — 2026-05-25

前回、workflow JSON の action に `path` / `paths` を持たせた。今回は、その JSON の形そのものを `recipe-images:workflow:schema` で確認できるようにした。地図を描き足した後で、凡例も一緒に置いておくようなものだ。

## やったこと

### Step 1: `--workflow-schema` を追加

`scripts/generate-recipe-image-sql.mjs` に `--workflow-schema` を追加した。

出力には次を含める。

- `schemaVersion`
- `command`
- `fields`
- `definitions`

`status` の取りうる値、`WorkflowFileState`、`WorkflowActionItem`、`nextActions` が `nextActionItems[].label` 由来であることも確認できる。

### Step 2: npm script と自己検査を追加

`package.json` に次を追加した。

```powershell
npm.cmd run --silent recipe-images:workflow:schema
```

`scripts/generate-recipe-image-sql.test.mjs` では、schema の command、status values、action type、`paths` metadata を検査するようにした。

### Step 3: README / ROADMAP / handoff を更新

README に schema 出力の導線を追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_86` へ進めた。

`NEXT_CHAT_HANDOFF.md` も `PROGRESS_86` 時点へ更新した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run --silent recipe-images:workflow:schema` が schema JSON を出す
- `npm.cmd run --silent recipe-images:workflow:json` が通る
- `npm.cmd run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run --silent recipe-images:workflow:schema
npm.cmd run --silent recipe-images:workflow:json
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run --silent recipe-images:workflow:schema` -> pass
- `npm.cmd run --silent recipe-images:workflow:json` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_86.md`
