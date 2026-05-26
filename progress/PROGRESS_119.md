# PROGRESS_119

> login public E2E coverage 追加 - 2026-05-26

## ねらい

公開前 E2E は `/signup` まで確認していた。ただ、ログイン画面は実運用で毎回通る入口なのに、公開導線の確認対象からは抜けていた。

E2E は end-to-end、つまり入口から出口までをまとめて見る検査だよ。入口の片方だけを見るより、ログインと新規登録の両方を確認した方が、公開前の道標として信頼できる。

## 変更内容

### Step 1: 公開導線 E2E に `/login` を追加

`scripts/e2e-public-flow.mjs` で Supabase 設定済みの時に、次の route も確認するようにした。

```text
/login
```

期待する主要文言は次。

- `ログイン`
- `メールアドレス`
- `新規登録`

### Step 2: fixture 自己検査を更新

`scripts/e2e-public-flow.test.mjs` の fixture server に `/login` を追加した。

さらに、外部 URL モードの自己検査で `ok /login` が stdout に出ることを確認するようにした。これで、将来 E2E 本体から `/login` が外れた場合も自己検査で気づける。

### Step 3: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、公開導線 E2E が `/login` も見ることを反映した。

## 検証

```powershell
npm.cmd run e2e:public:test
npm.cmd run docs:progress-index
npm.cmd run docs:links
```

どれも pass。

このあと標準どおり、次も通す。

```powershell
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
- `progress/PROGRESS_119.md`
