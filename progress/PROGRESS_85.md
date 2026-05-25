# PROGRESS_85

> **画像 URL workflow action path metadata 追加** — 2026-05-25

前回、workflow JSON に `nextActionItems` を追加した。今回は、その action がどの file（ファイル）を相手にするのかを `path` / `paths` として持たせた。命令書に「台所へ行け」と書くなら、どの棚を開くかも添えるべきだからだ。

## やったこと

### Step 1: action に path metadata を追加

`scripts/generate-recipe-image-sql.mjs` に `buildPathDetails()` を追加した。

`nextActionItems` の主要 action に次を入れる。

- `path`: 主対象のファイル
- `paths`: 関連する複数ファイルの一覧

actual manifest、todo checklist、migration SQL の対象 path を、自動化が JSON から拾いやすくした。

### Step 2: `nextActions` と `nextActionItems` のラベルを同期

actual manifest 不在時も、`nextActions` は `nextActionItems.label` から生成するように揃えた。

これで人間向け文字列と構造化 action の文言がずれにくくなる。

### Step 3: 自己検査と README / ROADMAP を更新

`scripts/generate-recipe-image-sql.test.mjs` で次を確認するようにした。

- `create-actual-manifest` の path
- `fill-image-urls` の path
- `generate-actual-migration` の path
- `apply-actual-migration` の path
- `rerun-workflow` の paths

README に `path` / `paths` の意味を追記し、ROADMAP も `PROGRESS_85` へ進めた。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run --silent recipe-images:workflow:json` が `path` / `paths` を含む JSON を出す
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
- `progress/PROGRESS_85.md`
