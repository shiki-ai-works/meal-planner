# PROGRESS_94

> **E2E build guard** — 2026-05-25

`e2e:public:run` は build 済みの `.next` を使って公開導線 E2E だけを走らせる軽量コマンドになった。今回は、その前提が崩れた時に `next start` の曖昧な失敗へ進まず、先に何を実行すべきか案内する guard を追加した。

## やったこと

### Step 1: local build artifact を確認

`scripts/e2e-public-flow.mjs` で、ローカルの `next start` を使う前に `.next/BUILD_ID` を確認するようにした。

存在しない場合は、次を案内して停止する。

```text
Run npm.cmd run build before npm.cmd run e2e:public:run.
Alternatively, run npm.cmd run e2e:public or npm.cmd run release:check.
```

### Step 2: external URL は guard 対象外

`E2E_BASE_URL` が指定されている場合は、外部の起動済み環境を相手にするため、ローカル `.next/BUILD_ID` は要求しない。

### Step 3: README / DEPLOYMENT / handoff / ROADMAP を更新

`e2e:public:run` が build 済み前提であることと、build が無い時の案内をドキュメントに追記した。

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

- `scripts/e2e-public-flow.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_94.md`
