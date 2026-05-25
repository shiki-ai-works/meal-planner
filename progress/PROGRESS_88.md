# PROGRESS_88

> **画像 URL source notes 検査** — 2026-05-25

前回までで workflow JSON の地図は整った。今回は、実画像 URL と出典メモが一対一で結ばれているかを検査できるようにした。画像 URL は道で、source note は道標だ。道だけあって道標が無いと、あとで誰がその道を通ってよいのか分からなくなる。

## やったこと

### Step 1: source notes 検査コマンドを追加

`scripts/generate-recipe-image-sql.mjs` に `--sources-check` を追加し、`package.json` に短縮コマンドを追加した。

```powershell
npm.cmd run recipe-images:sources-check
```

この検査では、`supabase/recipe-images.actual.json` の全 `image_urls` に対して、`supabase/recipe-images.sources.json` の出典メモが存在するかを確認する。

### Step 2: source notes の形を検査

source note は次の field を見る。

- `recipe`
- `image_url`
- `source_page_url`
- `author`
- `license`
- `fit`

`fit` は `exact` / `close` / `representative` のいずれかに限定した。`source_page_url` と `image_url` は http(s) URL であることも確認する。

### Step 3: workflow に source notes を載せた

`recipe-images:workflow` / `recipe-images:workflow:json` の `files` に `sourceNotes` を追加した。

現在の workflow では、SQL 適用前の次アクションとして次も表示される。

```text
run npm.cmd run recipe-images:sources-check
```

### Step 4: README / ROADMAP / handoff を更新

README に source notes 検査の説明を追記した。ROADMAP は `PROGRESS_88` に進め、`NEXT_CHAT_HANDOFF.md` も現在の `ready-to-apply-migration` 状態へ更新した。

## 確認したこと

- `recipe-images:workflow:test` が通る
- 実データの `recipe-images:sources-check` が通る
- `recipe-images:workflow:json` に `files.sourceNotes` と `check-image-sources` action が出る
- ローカル作業状態では 35 件の URL と 35 件の source note が対応している
- 9 件は author / license を source page で再確認する warning が残っている

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run recipe-images:sources-check
npm.cmd run --silent recipe-images:workflow:json
npm.cmd run --silent recipe-images:workflow:schema
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run recipe-images:sources-check` -> pass（9 件の attribution 再確認 warning あり）
- `npm.cmd run --silent recipe-images:workflow:json` -> pass
- `npm.cmd run --silent recipe-images:workflow:schema` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass

## 変更ファイル

- `.gitignore`
- `package.json`
- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_88.md`
