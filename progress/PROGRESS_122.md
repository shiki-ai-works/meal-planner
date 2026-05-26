# PROGRESS_122

> user-data export unauth public E2E coverage 追加 - 2026-05-26

## ねらい

未ログイン `/api/generate-plan` の `401` は公開導線 E2E で確認できるようになった。次は、個人データを書き出す `/api/user-data/export` も同じように未ログインで閉じているかを見る。

export は保存データを外へ取り出す出口だよ。献立生成よりさらに個人情報に近い場所だから、起動後検査で `401 Unauthorized` を確認しておく。

## 変更内容

### Step 1: `/api/user-data/export` の未ログイン guard を確認

`scripts/e2e-public-flow.mjs` で、Supabase 設定済みの時に次を確認するようにした。

```text
GET /api/user-data/export -> 401 Unauthorized
```

`401` は認証が必要という意味の HTTP status。

### Step 2: fixture 自己検査を更新

`scripts/e2e-public-flow.test.mjs` の fixture server に `/api/user-data/export` の `401` 応答を追加した。

外部 URL モードの自己検査では、stdout に `ok /api/user-data/export 401` が出ることも確認する。

### Step 3: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、公開導線 E2E が未ログイン `/api/user-data/export` の `401` も見ることを反映した。

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
- `progress/PROGRESS_122.md`
