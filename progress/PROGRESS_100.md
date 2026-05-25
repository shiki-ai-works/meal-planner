# PROGRESS_100

> **source notes report JSON** — 2026-05-25

人間向けの `sources-report` は読める地図として使いやすい。一方で、自動化や次チャットが読むには JSON のほうが扱いやすい。そこで同じ出典 warning 情報を機械可読 JSON でも出せるようにした。

## やったこと

### Step 1: `--sources-report-json` を追加

`scripts/generate-recipe-image-sql.mjs` に `--sources-report-json` を追加した。

主な出力:

- `schemaVersion`
- `actualManifestPath`
- `actualSourcesPath`
- `expectedUrlCount`
- `sourceCount`
- `warnings`
- `errors`
- `placeholderAttributionCount`
- `placeholderAttributionSources`
- `nextActions`

`placeholderAttributionSources` には、recipe / sourcePageUrl / imageUrl / author / license が入る。

### Step 2: package script を追加

`package.json` に次を追加した。

```powershell
npm.cmd run --silent recipe-images:sources-report:json
```

### Step 3: 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` で、次を確認するようにした。

- placeholder attribution warning がある場合、JSON が recipe と source page URL を含む
- warning がない場合、strict 検査への next action を含む
- source note が欠けている場合、exit code 1 でも JSON stdout に errors が入る

### Step 4: docs を更新

README / ROADMAP / handoff に、`sources-report` は人間向け、`sources-report:json` は自動化・引き継ぎ向けとして追記した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run --silent recipe-images:sources-report:json` -> pass（9 件の placeholder attribution source を JSON 出力）
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `http://localhost:3000/setup` HTTP 確認 -> 200

`release:check` の中で、setup doctor 自己検査、画像 workflow 自己検査、E2E script 自己検査、workflow 診断、typecheck、lint、build、source notes check、公開導線 E2E が通った。

## 現在の JSON 結果

実データでは、`placeholderAttributionCount` が 9。`placeholderAttributionSources` に 9 件の recipe / sourcePageUrl / imageUrl / author / license が入る。

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_100.md`
