# PROGRESS_69

> **setup doctor help 追加** — 2026-05-25

`setup:doctor` に JSON と strict が増えたので、使い方を script 自身から見られるようにした。道具箱に札を付けるような仕事だ。札があれば、次に開ける者の手が迷わない。

## やったこと

### Step 1: `--help` を追加

`scripts/check-supabase-env.mjs` に `--help` / `-h` を追加した。

```powershell
npm run setup:doctor:help
```

表示内容には、通常診断、strict、JSON、help の使い分けを入れた。

### Step 2: 未知 option を検出

知らない option を渡した場合、黙って無視せず終了コード 1 で止めるようにした。

```powershell
node scripts/check-supabase-env.mjs --unknown
```

この場合は `npm run setup:doctor:help` を見るよう案内する。

### Step 3: README と `/setup` を更新

README の Supabase 設定に help コマンドを追記した。

`/setup` の `.env.local` セクションにも `npm run setup:doctor:help` を表示した。

## 確認したこと

- help が表示される
- 未知 option が終了コード 1 で止まる
- 通常診断と JSON 診断は引き続き動く
- `/setup` で help コマンドが見える

## 検証コマンド

```powershell
npm.cmd run setup:doctor:help
npm.cmd run --silent setup:doctor:json
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run setup:doctor:help` -> pass
- `node scripts/check-supabase-env.mjs --unknown` -> expected fail（未知 option を終了コード 1 で検出）
- `npm.cmd run --silent setup:doctor:json` -> pass（JSON parse 確認済み）
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `npm run setup:doctor:help` を確認）

## 変更ファイル

- `scripts/check-supabase-env.mjs`
- `package.json`
- `README.md`
- `src/app/setup/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_69.md`
