# PROGRESS_124

> delete missing-header public E2E coverage 追加 - 2026-05-26

## ねらい

確認 header 付きの未ログイン `/api/user-data/delete` は、公開導線 E2E で `401 Unauthorized` まで確認できるようになった。次は、確認 header 自体が無い時に、認証処理へ進む前の `400` で止まることも起動後に見る。

削除 API は破壊的な入口だから、二段の鍵を両方確認する。第一の鍵は「削除の意思を示す header」、第二の鍵は「ログイン済みの session」だよ。

## 変更内容

### Step 1: header なし DELETE の runtime check を追加

`scripts/e2e-public-flow.mjs` に、次の確認を追加した。

```text
DELETE /api/user-data/delete -> 400 削除確認ヘッダーが必要です
```

これで、確認 header が無い DELETE request は、Supabase auth へ進む前に止まることを起動後検査で確認する。

### Step 2: fixture 自己検査を更新

`scripts/e2e-public-flow.test.mjs` では、すでに fixture server が header なし DELETE に `400` を返すようになっている。

今回は stdout に `ok /api/user-data/delete 400` が出ることも確認対象へ追加した。

### Step 3: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、公開導線 E2E が削除 API の header 不足 `400` も見ることを反映した。

## 検証

```powershell
npm.cmd run e2e:public:test
```

pass。

このあと標準どおり、次も通す。

```powershell
npm.cmd run docs:progress-index
npm.cmd run docs:links
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 変更ファイル

- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_124.md`
