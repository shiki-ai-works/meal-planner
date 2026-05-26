# PROGRESS_110

> **auth E2E build guard 自己検査** - 2026-05-26

認証付き E2E は、本物のテストユーザーで「ログインして、保存して、もう一度入っても残っているか」を見る検査だよ。だからこそ、実行前の安全ガードが大事になる。今回は、local build が無い時に Supabase へ触る前で止まることを自己検査できるようにした。

## やったこと

### Step 1: local build guard の自己検査を追加

`scripts/e2e-auth-flow.test.mjs` に、一時フォルダから `scripts/e2e-auth-flow.mjs` を起動するケースを追加した。
一時フォルダには `.next/BUILD_ID` が無いので、local build が無い状態を安全に再現できる。

確認すること:

- `Missing production build: .next/BUILD_ID` と表示して失敗する
- `npm.cmd run build` を先に実行するよう案内する
- Supabase login や signup に進む前に止まる

local build は、手元で作った本番用 build のこと。`next start` はこの build を使って起動する。

### Step 2: docs を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF に、`e2e:auth:test` が確認する安全ガードを追記した。
credential は認証情報のことなので、`.env.local` や CI secret に置き、Git には commit しない方針もそのまま維持した。

### Step 3: ROADMAP を更新

ROADMAP の最終更新を PROGRESS_110 に進め、関連ドキュメントにもこの note を追加した。
これで `docs:progress-index` も最新状態を確認できる。

## 確認したこと

- `npm.cmd run e2e:auth:test` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass

## 変更ファイル

- `scripts/e2e-auth-flow.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_110.md`
