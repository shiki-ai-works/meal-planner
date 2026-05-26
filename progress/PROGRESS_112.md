# PROGRESS_112

> **user data delete guard check** - 2026-05-26

前回、ユーザーデータ削除 API に確認 header を足した。今回は、その鍵が将来の編集で外れないように、通常検査で見張るようにしたよ。実際に削除を走らせるのではなく、コードの形を読む静的検査にしている。

## やったこと

### Step 1: delete guard checker を追加

`scripts/check-user-data-delete-guard.mjs` を追加した。
この script は次を確認する。

- 削除確認テキストと header 名が `src/lib/user-data.ts` にまとまっている
- `/api/user-data/delete` が `Request` を受け取り、Supabase client を作る前に confirmation header を確認している
- header が無い場合に 400 で止める
- 設定画面の削除 UI が共有 confirmation text を使う
- 設定画面の削除 UI が confirmation header を送る
- UI が `fetch('/api/user-data/delete')` の前に確認テキストを見ている

### Step 2: 自己検査を追加

`scripts/check-user-data-delete-guard.test.mjs` を追加した。
一時フォルダに小さな route / client / helper を作り、次のケースを確認する。

- 正しい wiring は pass
- confirmation check が `createClient()` より後なら fail
- UI が confirmation header を送らないなら fail

### Step 3: 通常検査へ組み込み

`user-data:delete-guard` と `user-data:delete-guard:test` を `package.json` に追加し、`npm run check` に組み込んだ。
README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も更新した。

## 確認したこと

- `npm.cmd run user-data:delete-guard:test` -> pass
- `npm.cmd run user-data:delete-guard` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass

## 変更ファイル

- `scripts/check-user-data-delete-guard.mjs`
- `scripts/check-user-data-delete-guard.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_112.md`
