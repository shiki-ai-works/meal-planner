# PROGRESS_93

> **release check build 再利用** — 2026-05-25

`release:check` は公開前のまとめ検査として有効になったが、`check` と `e2e:public` の両方で build が走っていた。今回は、公開前検査の意味を保ったまま、重複 build を避ける構成にした。

## やったこと

### Step 1: build 済み E2E コマンドを追加

`package.json` に次を追加した。

```powershell
npm.cmd run e2e:public:run
```

これは build を実行せず、既存の `.next` を使って `scripts/e2e-public-flow.mjs` だけを走らせる。

### Step 2: release check を軽くした

`release:check` を次の流れに変更した。

```text
npm run check
npm run recipe-images:sources-check
npm run e2e:public:run
```

`check` の最後に build が走るため、その build 結果を E2E で再利用する。

### Step 3: README / DEPLOYMENT / handoff / ROADMAP を更新

公開前は `release:check`、build 済みの E2E 単体確認は `e2e:public:run` と分けて読めるようにした。

## 確認したこと

- `npm.cmd run release:check` が通る
- `npm.cmd run e2e:public:run` が通る
- `git diff --check` が通る
- dev server を起動し、`/setup` が HTTP 200 を返す

## 検証コマンド

```powershell
npm.cmd run release:check
npm.cmd run e2e:public:run
git diff --check
```

## 結果

- `npm.cmd run release:check` -> pass
- `npm.cmd run e2e:public:run` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` HTTP 確認 -> pass

## 変更ファイル

- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_93.md`
