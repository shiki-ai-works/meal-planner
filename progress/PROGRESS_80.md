# PROGRESS_80

> **画像 URL workflow JSON 出力** — 2026-05-25

前回、画像 URL workflow を標準検査に組み込んだ。今回は同じ診断を JSON でも取り出せるようにした。人が読む札と、機械が読む札を同じ台帳から出す形だ。

## やったこと

### Step 1: `--workflow-json` を追加

`scripts/generate-recipe-image-sql.mjs` に `--workflow-json` を追加した。

出力には次を含める。

```text
schemaVersion
files
summary
nextActions
```

### Step 2: `recipe-images:workflow:json` を追加

`package.json` に次の短縮コマンドを追加した。

```powershell
npm.cmd run --silent recipe-images:workflow:json
```

`--silent` を付けると npm の見出しを省き、JSON だけを取り出せる。

### Step 3: README / ROADMAP を更新

README に自動化や記録向けの JSON 導線を追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_80` へ進めた。

## 確認したこと

- `npm run --silent recipe-images:workflow:json` が JSON を出す
- `node scripts/generate-recipe-image-sql.mjs --workflow-json` の出力を `JSON.parse` できる
- 人間向けの `--workflow` 表示は従来どおり出る
- `npm run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run --silent recipe-images:workflow:json
node scripts\generate-recipe-image-sql.mjs --workflow
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run --silent recipe-images:workflow:json` -> pass
- `node` で JSON parse -> pass
- `node scripts\generate-recipe-image-sql.mjs --workflow` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass（Supabase setup 画面とデモ導線を確認）

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_80.md`
