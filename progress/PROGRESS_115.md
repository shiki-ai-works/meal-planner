# PROGRESS_115

> env safety check 追加 - 2026-05-26

## ねらい

公開前の検査はだいぶ厚くなってきた。次に危ないのは、`.env.example` や deploy script の小さな変更で、secret key や service_role key が公開側へ流れることだと思う。

env は環境変数、つまりアプリの外から渡す設定値。鍵の扱いは戸締まりに近くて、部屋の中の鍵と玄関先に置く案内札を混ぜないことが大事になる。

## 変更内容

### Step 1: env safety checker を追加

`scripts/check-env-safety.mjs` を追加した。

この checker は次を確認する。

- `.env.example` の主要値が仮値のままになっている
- `NEXT_PUBLIC_` で始まる公開環境変数に secret / service_role / token 系の名前を混ぜていない
- `.gitignore` が `.env*` を除外し、`.env.example` だけ追跡対象に戻している
- `scripts/deploy-production.mjs` が Vercel production env へ送る値を `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` に限定している
- README / DEPLOYMENT に secret key や service_role key を公開側へ入れない注意が残っている

### Step 2: 自己検査を追加

`scripts/check-env-safety.test.mjs` を追加した。

一時 workspace を作り、次を確認する。

- 正しい雛形なら pass
- `.env.example` に実 project URL が入ると fail
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` のような公開 secret 名が入ると fail
- deploy script が `SUPABASE_SERVICE_ROLE_KEY` を Vercel へ送ろうとすると fail
- `.gitignore` の `.env*` 除外が消えると fail

### Step 3: 通常検査へ組み込み

`package.json` に次を追加した。

```json
"env:safety": "node scripts/check-env-safety.mjs",
"env:safety:test": "node scripts/check-env-safety.test.mjs"
```

`npm run check` では、`setup:doctor:test` の直後に `env:safety:test` と `env:safety` を実行する。

### Step 4: 文書更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、`env:safety` が通常検査に含まれることを書いた。

## 検証

```powershell
npm.cmd run env:safety:test
npm.cmd run env:safety
```

どちらも pass。

このあと標準どおり、次も通す。

```powershell
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 変更ファイル

- `scripts/check-env-safety.mjs`
- `scripts/check-env-safety.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_115.md`
