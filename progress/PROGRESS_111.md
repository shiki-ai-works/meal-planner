# PROGRESS_111

> **user data delete confirmation header** - 2026-05-26

ユーザーデータ削除は、アプリの中でもいちばん重い操作だよ。UI で「削除」と入力させるだけでも防げるけれど、API の入口にも同じ意図確認を置いた。玄関の鍵だけでなく、奥の扉にも鍵をかける感じだね。

## やったこと

### Step 1: 共有 constant を追加

`src/lib/user-data.ts` を追加し、削除確認の文字列と header 名をまとめた。

- `USER_DATA_DELETE_CONFIRMATION`: `削除`
- `USER_DATA_DELETE_CONFIRMATION_HEADER`: `x-meal-planner-delete-confirmation`
- `hasUserDataDeleteConfirmation(headers)`: request header を確認する helper

header は request に添える小さな目印のこと。secret ではないけれど、意図しない DELETE を手前で止める役目を持つ。

### Step 2: delete API に server-side guard を追加

`src/app/api/user-data/delete/route.ts` で、確認 header が無い場合は 400 を返すようにした。
この時点では Supabase client を作らず、削除処理にも進まない。

### Step 3: 設定画面の削除 UI から header を送る

`DataControlsClient` は、確認テキストが `削除` と一致した場合だけ削除処理へ進む。
その fetch に確認 header を付けるようにした。

## 確認したこと

- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass

## 変更ファイル

- `src/lib/user-data.ts`
- `src/app/api/user-data/delete/route.ts`
- `src/app/(main)/settings/DataControlsClient.tsx`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_111.md`
