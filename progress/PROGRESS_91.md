# PROGRESS_91

> **source notes warning 対象表示** — 2026-05-25

`recipe-images:sources-check` は出典メモの件数と整合性を検査できるが、placeholder attribution warning が件数だけだった。今回は warning に対象 recipe 名を出し、source page で再確認すべき箇所を直接追えるようにした。

## やったこと

### Step 1: warning に recipe 名を追加

`scripts/generate-recipe-image-sql.mjs` の source notes 検査で、author / license に `See ...` が残る source note の recipe 名を収集するようにした。

warning は次の形になる。

```text
Warning: 9 source note(s) still ask the reviewer to inspect the source page for attribution/license details: ...
```

### Step 2: 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` に、placeholder attribution がある場合でも `--sources-check` は成功し、stderr に対象 recipe 名が出ることを確認するケースを追加した。

### Step 3: ドキュメント更新

README、ROADMAP、NEXT_CHAT_HANDOFF を更新し、source notes warning が対象 recipe 名を出すことを明記した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run recipe-images:sources-check` が通り、warning に対象 recipe 名が出る
- `npm.cmd run check` が通る
- dev server を起動し、`/setup` が HTTP 200 を返す
- Browser API の `/setup` navigation は timeout したため、画面検証は HTTP 応答確認に留めた

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run recipe-images:sources-check
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run recipe-images:sources-check` -> pass（warning に対象 recipe 名を表示）
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` HTTP 確認 -> pass（status 200、Supabase/setup 表示文字列あり）
- `/setup` Browser API 確認 -> navigation timeout

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_91.md`
