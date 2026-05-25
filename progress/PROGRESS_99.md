# PROGRESS_99

> **workflow source notes summary** — 2026-05-25

workflow が `ready-to-apply-migration` と言っていても、画像出典メモにはまだ再確認が残っている。そこで、source notes の残件数を workflow の要約にも出すようにした。

## やったこと

### Step 1: workflow summary に source notes 診断を追加

`scripts/generate-recipe-image-sql.mjs` の workflow JSON に `summary.sourceNotes` を追加した。

入る値:

- source notes の有無
- source note 数
- expected image URL 数
- source note warning 数
- source note error 数
- placeholder attribution warning 数

### Step 2: 人間向け workflow 表示にも件数を追加

`npm.cmd run recipe-images:workflow` で、次のように表示される。

```text
- source note warnings: 1
- source note errors: 0
- placeholder attribution warnings: 9
```

### Step 3: sources-report action に warning count を追加

placeholder attribution warning が残っている場合、workflow の next actions では次のように残件数が見える。

```text
- run npm.cmd run recipe-images:sources-report (9 warning target(s))
```

### Step 4: 自己検査と docs を更新

workflow schema に `SourceNotesSummary` を追加し、自己検査で source notes summary と report action count を確認するようにした。

README / ROADMAP / handoff にも反映した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run recipe-images:workflow` -> pass（source note warnings 1 / placeholder attribution warnings 9 を表示）
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `http://localhost:3000/setup` HTTP 確認 -> 200

`release:check` の中で、setup doctor 自己検査、画像 workflow 自己検査、E2E script 自己検査、workflow 診断、typecheck、lint、build、source notes check、公開導線 E2E が通った。

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_99.md`
