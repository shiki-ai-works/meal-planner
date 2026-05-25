# PROGRESS_87

> **画像 URL workflow schema 照合検査** — 2026-05-25

前回、workflow JSON の schema を出せるようにした。今回は、その schema と実際の workflow JSON が主要な約束を守っているかを自己検査で突き合わせるようにした。凡例と地図の線を、同じ机の上で重ねて見る作業だ。

## やったこと

### Step 1: schema / JSON 照合 helper を追加

`scripts/generate-recipe-image-sql.test.mjs` に次を追加した。

- `readWorkflowSchema()`
- `assertWorkflowMatchesSchema()`
- `assertFileStateMatchesSchema()`
- `assertActionItemMatchesSchema()`

### Step 2: workflow JSON の主要 field を共通検査

自己検査で次を確認するようにした。

- workflow が schema の top-level fields を持つこと
- `schemaVersion` が schema と一致すること
- `status` が schema の values に含まれること
- `files.*` が `path` / `status` / `exists` を持つこと
- `nextActionItems` が required fields と documented type を満たすこと
- `nextActions` が `nextActionItems[].label` から生成されていること

### Step 3: README / ROADMAP / handoff を更新

README に、workflow 自己検査が schema と実 JSON の主な field の噛み合いも確認することを追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_87` へ進めた。

`NEXT_CHAT_HANDOFF.md` も `PROGRESS_87` 時点へ更新した。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` が通る
- `npm.cmd run --silent recipe-images:workflow:json` が通り、現在 status は `collecting-image-urls`
- `supabase/recipe-images.actual.json` と `supabase/recipe-images.todo.md` は存在し、35 件の `image_urls` が未投入
- `npm.cmd run check` が通る
- `/setup` が引き続きブラウザで開ける

## 検証コマンド

```powershell
npm.cmd run recipe-images:workflow:test
npm.cmd run --silent recipe-images:workflow:json
npm.cmd run --silent recipe-images:workflow:schema
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run --silent recipe-images:workflow:json` -> pass
- `npm.cmd run --silent recipe-images:workflow:schema` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` ブラウザ確認 -> pass

## 変更ファイル

- `scripts/generate-recipe-image-sql.test.mjs`
- `README.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_87.md`
