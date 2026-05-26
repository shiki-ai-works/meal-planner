# PROGRESS_121

> generate-plan unauth public E2E coverage 追加 - 2026-05-26

## ねらい

公開導線 E2E で、未ログイン `/dashboard` が `/login` へ戻ることは確認できるようになった。次に見るべきなのは、画面を通らず `/api/generate-plan` を直接呼んだ時も止まるかどうか。

API は画面の外側からも呼べる入口だよ。UI の扉だけ閉まっていても、API の勝手口が開いていたら献立生成が先に進んでしまう。今回は未ログイン API 呼び出しの guard を公開前検査へ足した。

## 変更内容

### Step 1: API status 検査 helper を追加

`scripts/e2e-public-flow.mjs` に `checkApiStatus()` を追加した。

この helper は次を確認する。

- response status が期待値と一致する
- 期待文言が指定されている場合は response body に含まれる
- 成功時に `ok <path> <status>` を出す

### Step 2: `/api/generate-plan` の未ログイン guard を確認

Supabase 設定済みの時に、未ログインで `/api/generate-plan` へ POST する検査を追加した。

```text
POST /api/generate-plan -> 401 Unauthorized
```

body には有効な `weekStartDate` を入れる。これで JSON や日付形式の validation ではなく、認証 guard を確認できる。

### Step 3: fixture 自己検査を更新

`scripts/e2e-public-flow.test.mjs` の fixture server に `/api/generate-plan` の `401` 応答を追加した。

外部 URL モードの自己検査では、stdout に `ok /api/generate-plan 401` が出ることも確認する。

### Step 4: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、公開導線 E2E が未ログイン `/api/generate-plan` の `401` も見ることを反映した。

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
- `progress/PROGRESS_121.md`
