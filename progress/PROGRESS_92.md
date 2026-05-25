# PROGRESS_92

> **公開前 release check 追加** — 2026-05-25

公開前の確認が `check`、`recipe-images:sources-check`、`e2e:public` に分かれていた。今回は、それらを `release:check` にまとめた。公開候補を出す前に踏む一枚板を作る変更。

## やったこと

### Step 1: release check script を追加

`package.json` に次を追加した。

```powershell
npm.cmd run release:check
```

中身は次の順番。

```text
npm run check
npm run recipe-images:sources-check
npm run e2e:public
```

### Step 2: README / DEPLOYMENT を更新

README の検査セクションに `release:check` を追加した。

DEPLOYMENT の事前確認も `release:check` を入口にした。画像出典メモ検査は、ローカル作業用の `supabase/recipe-images.sources.json` が必要なことも明記した。

### Step 3: handoff / ROADMAP を更新

`NEXT_CHAT_HANDOFF.md` と `ROADMAP.md` を `PROGRESS_92` 時点へ更新した。

## 確認したこと

- `npm.cmd run release:check` が通る
- `npm.cmd run check` が通る
- `npm.cmd run recipe-images:sources-check` が通る
- `git diff --check` が通る
- `/setup` が HTTP 200 を返す

## 検証コマンド

```powershell
npm.cmd run release:check
npm.cmd run check
npm.cmd run recipe-images:sources-check
git diff --check
```

## 結果

- `npm.cmd run release:check` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run recipe-images:sources-check` -> pass（9 件の attribution 再確認 warning あり）
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` HTTP 確認 -> pass

## 変更ファイル

- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_92.md`
