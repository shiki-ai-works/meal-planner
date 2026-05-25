# PROGRESS_98

> **workflow source report action** — 2026-05-25

`recipe-images:sources-report` ができたので、画像 workflow の次アクションにも載せた。入口に地図が置いてあると、次に触る人が迷いにくい。

## やったこと

### Step 1: workflow の source note action を拡張

`scripts/generate-recipe-image-sql.mjs` の `buildSourceNoteActions` に、次の command action を追加した。

```powershell
npm.cmd run recipe-images:sources-report
```

source notes が存在する場合、workflow には次の 2 つが並ぶ。

- `recipe-images:sources-check`: 出典メモが actual manifest と合っているか確認する
- `recipe-images:sources-report`: warning 修正対象を source page URL つきで見る

### Step 2: workflow 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` に、`review-image-source-warnings` action が出ること、command が `recipe-images:sources-report` であること、source notes path を持つことを追加した。

### Step 3: README / handoff / ROADMAP を更新

workflow から report に到達できることを文書に残した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run recipe-images:workflow` -> pass（next actions に `recipe-images:sources-report` を表示）
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
- `progress/PROGRESS_98.md`
