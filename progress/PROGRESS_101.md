# PROGRESS_101

> **source notes report Markdown** — 2026-05-25

JSON は自動化向けには強い。でも人が source page を開いて author / license を確認していく作業には、チェックリストのほうが手に馴染む。そこで `sources-report` を Markdown でも出せるようにした。

## やったこと

### Step 1: `--sources-report-markdown` を追加

`scripts/generate-recipe-image-sql.mjs` に `--sources-report-markdown` を追加した。

出力内容:

- actual manifest
- source notes
- expected recipe image URL 数
- source note 数
- placeholder attribution warning 数
- error 一覧
- `- [ ]` 形式の review checklist
- next actions

### Step 2: package script を追加

`package.json` に次を追加した。

```powershell
npm.cmd run recipe-images:sources-report:markdown
```

### Step 3: 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` で、次を確認するようにした。

- warning がある場合、Markdown に recipe の checkbox と source page URL が出る
- warning がない場合、完了済み checkbox が出る
- source note が欠けている場合、exit code 1 で errors section が出る

### Step 4: docs を更新

README / ROADMAP / handoff に、`sources-report:markdown` は人間が source page を確認するためのチェックリストとして使うことを追記した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run --silent recipe-images:sources-report:markdown` -> pass（9 件を checkbox で出力）
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `http://localhost:3000/setup` HTTP 確認 -> 200

`release:check` の中で、setup doctor 自己検査、画像 workflow 自己検査、E2E script 自己検査、workflow 診断、typecheck、lint、build、source notes check、公開導線 E2E が通った。

## 現在の Markdown 結果

実データでは、placeholder attribution warning 9 件が `- [ ]` のチェックリストとして出る。

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_101.md`
