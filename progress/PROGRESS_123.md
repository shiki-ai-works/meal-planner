# PROGRESS_123

> ASCII-safe delete header and delete unauth E2E coverage 追加 - 2026-05-26

## ねらい

未ログイン `/api/user-data/delete` の `401` を公開導線 E2E に追加しようとしたところ、Node の `fetch` が header 値 `削除` を送れずに失敗した。

これは検査だけの問題ではない。HTTP header は通信の札のようなもので、値は ASCII 安全な文字にしておく方がよい。UI で入力させる確認 text は日本語のまま残し、通信 header の値だけ英数字へ分ける。

## 変更内容

### Step 1: 削除確認 header 値を ASCII-safe に変更

`src/lib/user-data.ts` に次を追加した。

```ts
export const USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE = 'delete-confirmed'
```

`USER_DATA_DELETE_CONFIRMATION` は引き続き `削除`。これは画面でユーザーに入力してもらう確認 text として使う。

`hasUserDataDeleteConfirmation()` は、header の値を `USER_DATA_DELETE_CONFIRMATION_HEADER_VALUE` と比較するようにした。

### Step 2: 設定画面の DELETE request を更新

`DataControlsClient` が、確認 text `削除` の一致を見たあと、通信 header には `delete-confirmed` を送るようにした。

これで UI 上の確認と、HTTP header 上の安全な通信値を分離できる。

### Step 3: delete guard checker を更新

`scripts/check-user-data-delete-guard.mjs` と自己検査 fixture を更新した。

確認する内容:

- 確認 text `削除` が共通定数のまま
- header 名が共通定数のまま
- header 値 `delete-confirmed` が共通定数化されている
- 設定画面が ASCII-safe な header 値を送る

### Step 4: 公開導線 E2E に delete API の未ログイン guard を追加

`scripts/e2e-public-flow.mjs` で、確認 header 付きの未ログイン DELETE を追加した。

```text
DELETE /api/user-data/delete -> 401 Unauthorized
```

確認 header を付けることで、`400` の header 不足ではなく、認証 guard の `401` まで進むことを確認する。

### Step 5: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、header 値の ASCII-safe 化と未ログイン delete API E2E を反映した。

## 検証

```powershell
npm.cmd run e2e:public:test
npm.cmd run user-data:delete-guard:test
npm.cmd run user-data:delete-guard
```

どれも pass。

このあと標準どおり、次も通す。

```powershell
npm.cmd run docs:progress-index
npm.cmd run docs:links
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 変更ファイル

- `src/lib/user-data.ts`
- `src/app/(main)/settings/DataControlsClient.tsx`
- `scripts/check-user-data-delete-guard.mjs`
- `scripts/check-user-data-delete-guard.test.mjs`
- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_123.md`
