# PROGRESS_95

> **E2E build guard 自己検査** — 2026-05-25

`e2e:public:run` に build guard を追加したので、今回はその guard 自体を自己検査で守るようにした。E2E の入口は公開前の重要な門なので、門番の動きも検査対象にした。

## やったこと

### Step 1: E2E script の自己検査を追加

`scripts/e2e-public-flow.test.mjs` を追加した。

確認すること:

- ローカル実行で `.next/BUILD_ID` が無い場合、明確な案内で失敗する
- `E2E_BASE_URL` 指定時は、ローカル build が無くても外部 URL を検査できる

外部 URL の分岐は、一時 HTTP サーバーを立てて `/setup`、`/demo`、`/legal` 系、`/signup` に必要な文字列だけを返して確認する。

### Step 2: package script を追加

`package.json` に次を追加した。

```powershell
npm.cmd run e2e:public:test
```

`npm run check` にも組み込み、通常検査で E2E script の入口回帰を検出できるようにした。

### Step 3: Windows 終了処理を安全化

外部 URL を相手にした E2E が全ページ pass した後、最後の `process.exit()` で Windows 側の Node assertion を踏むことがあった。一方、ローカルの `next start` を子プロセスで起動した場合は、自然終了だけでは pipe が残り得る。そこで、外部 URL では自然終了、ローカルサーバーを起動した場合だけ `taskkill` 後に明示終了する形にした。

### Step 4: README / DEPLOYMENT / handoff / ROADMAP を更新

`e2e:public:test` の用途と、`check` に含まれることを追記した。

## 確認したこと

- `npm.cmd run e2e:public:test` が通る
- `npm.cmd run check` が通る
- `npm.cmd run release:check` が通る
- `git diff --check` が通る
- dev server を起動し、`/setup` が HTTP 200 を返す

## 検証コマンド

```powershell
npm.cmd run e2e:public:test
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 結果

- `npm.cmd run e2e:public:test` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/setup` HTTP 確認 -> pass

## 変更ファイル

- `scripts/e2e-public-flow.test.mjs`
- `scripts/e2e-public-flow.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_95.md`
