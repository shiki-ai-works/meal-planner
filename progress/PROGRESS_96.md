# PROGRESS_96

> **source notes strict 検査** — 2026-05-25

画像出典メモの通常検査は、placeholder attribution を warning として表示しつつ通る。今回は、最終公開前にその warning も失敗扱いにできる strict 検査を追加した。

## やったこと

### Step 1: `--sources-check --strict` を許可

`scripts/generate-recipe-image-sql.mjs` で、`--sources-check` と `--strict` を併用できるようにした。

strict 時は source notes warning を error に昇格する。

### Step 2: package script を追加

`package.json` に次を追加した。

```powershell
npm.cmd run recipe-images:sources-check:strict
```

### Step 3: 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` の source notes test に、placeholder attribution warning が strict では失敗することを追加した。

### Step 4: README / DEPLOYMENT / handoff / ROADMAP を更新

通常の `recipe-images:sources-check` は作業中の確認、`recipe-images:sources-check:strict` は最終公開前の追加確認として書き分けた。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run recipe-images:sources-check` が通る
- `npm.cmd run check` が通る
- `npm.cmd run release:check` が通る
- `recipe-images:sources-check:strict` は現在の実データでは placeholder attribution warning を error として扱い、期待どおり失敗する
- dev server を起動し、`/setup` が HTTP 200 を返す

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run recipe-images:sources-check
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run recipe-images:sources-check` -> pass（9 件の attribution 再確認 warning あり）
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` HTTP 確認 -> pass

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_96.md`
