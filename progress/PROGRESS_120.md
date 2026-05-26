# PROGRESS_120

> protected redirect public E2E coverage 追加 - 2026-05-26

## ねらい

公開導線 E2E は `/login` と `/signup` を確認するようになった。次に見るべきなのは、未ログインのまま保護ページへ入ろうとした時に、ちゃんと入口へ戻されるかどうか。

redirect は、別の画面へ案内し直す応答のことだよ。玄関の案内だけが整っていても、裏口が開いていたら公開前検査としては弱い。今回は `/dashboard` の未ログイン redirect を E2E に足した。

## 変更内容

### Step 1: redirect 検査 helper を追加

`scripts/e2e-public-flow.mjs` に `checkRedirect()` を追加した。

この helper は次を確認する。

- response status が `301` / `302` / `303` / `307` / `308` のいずれか
- `location` header がある
- `location` の pathname が期待値と一致する

### Step 2: `/dashboard` の未ログイン redirect を確認

Supabase 設定済みの時に、未ログインで `/dashboard` を開くと `/login` へ redirect されることを確認するようにした。

```text
/dashboard -> /login
```

### Step 3: fixture 自己検査を更新

`scripts/e2e-public-flow.test.mjs` の fixture server に `/dashboard` redirect を追加した。

外部 URL モードの自己検査では、stdout に `ok /dashboard -> /login` が出ることも確認する。

### Step 4: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、公開導線 E2E が未ログイン `/dashboard` redirect も見ることを反映した。

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
- `progress/PROGRESS_120.md`
