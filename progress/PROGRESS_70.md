# PROGRESS_70

> **setup doctor self-test 追加** — 2026-05-25

`setup:doctor` は、Supabase の鍵を入れる前後の門番になってきた。今回はその門番自身を軽く試す self-test を追加した。番人の持つ灯が消えていないか、巡回前に確かめるようなものだ。

## やったこと

### Step 1: self-test script を追加

`scripts/check-supabase-env.test.mjs` を追加した。

この script は一時フォルダを作り、実際の `.env.local` には触れずに `check-supabase-env.mjs` を実行する。

確認するケース:

- env ファイルが無い場合は `required`
- `.env.local` が仮値の場合は `check`
- `.env.local` が `.env` を上書きし、正常値なら `ready`
- `--strict --json` は未設定時に終了コード 1
- 未知 option は終了コード 1
- `--help` は使い方を表示

### Step 2: 秘密値の漏れも確認

正常値ケースでは、JSON 出力に Supabase URL や anon key の実値が含まれないことも確認する。

### Step 3: npm script と README を更新

`package.json` に次を追加した。

```json
"setup:doctor:test": "node scripts/check-supabase-env.test.mjs"
```

README に self-test の実行手順を追記した。

## 確認したこと

- `npm run setup:doctor:test` が通る
- `npm run check` が通る
- `/setup` は引き続き開ける

## 検証コマンド

```powershell
npm.cmd run setup:doctor:test
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run setup:doctor:test` -> pass
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `SETUP REQUIRED`、doctor/help 導線、診断 JSON 導線を確認）

## 変更ファイル

- `scripts/check-supabase-env.test.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_70.md`
