# PROGRESS_83

> **画像 URL workflow status 検査拡充** — 2026-05-25

前回、workflow に `status` を追加した。今回は、その主要な分岐を自己検査で再現するようにした。標識を立てたなら、雨の日にも読めるか確かめるべきだからだ。

## やったこと

### Step 1: actual manifest helper を柔軟化

`scripts/generate-recipe-image-sql.test.mjs` の `writeActualManifest()` に任意の recipe 配列を渡せるようにした。

これで一時 workspace 上で、URL 未入力・warning・seed coverage error などを小さく再現できる。

### Step 2: status 分岐の検査を追加

追加した検査:

- `collecting-image-urls`
- `needs-warning-review`
- `blocked-by-errors`
- `migration-outdated`
- `ready-to-apply-migration`

既存の `missing-actual-manifest` と `ready-to-generate-migration` も引き続き検査している。

### Step 3: README / ROADMAP を更新

README に、workflow 自己検査が主要 `status` も確認することを追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_83` へ進めた。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass

## 変更ファイル

- `scripts/generate-recipe-image-sql.test.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_83.md`
