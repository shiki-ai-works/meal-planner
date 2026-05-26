# PROGRESS_132

> auth generate-plan no-store E2E coverage 追加 - 2026-05-26

## ねらい

`/api/generate-plan` は、未ログイン時だけでなく成功時にも献立データを返す。
この成功応答にはユーザーの設定や選ばれた献立が含まれるので、`Cache-Control: no-store` の確認を認証付き E2E にも置いておく価値がある。

前回の PROGRESS_131 では `assign-recipe` と `user-data export` の確認を守った。
今回は同じ輪の中に `generate-plan` 成功系も入れた。

## 変更内容

### Step 1: 認証付き E2E に generate-plan header check を追加

`scripts/e2e-auth-flow.mjs` で、成功した `POST /api/generate-plan` の直後に `cache-control` を確認するようにした。

期待値は次の通り。

```text
Cache-Control: no-store
```

### Step 2: 静的ガードにも追加

`scripts/check-private-api-cache.mjs` が、auth E2E 内に generate-plan の no-store 確認が残っているかも見るようにした。

### Step 3: negative self-test を追加

`scripts/check-private-api-cache.test.mjs` に、auth E2E から generate-plan の no-store 確認が消えた場合の失敗ケースを追加した。

これで、未ログイン確認、公開導線確認、認証付き成功系確認が三角形みたいに支え合う。
ひとつだけに頼らない形に近づいたと思う。

## 検証

```powershell
npm.cmd run private-api:cache:test
npm.cmd run private-api:cache
npm.cmd run e2e:auth:test
npm.cmd run docs:progress-index
npm.cmd run docs:links
npm.cmd run check
npm.cmd run release:check
git diff --check
```

すべて pass。

## 変更ファイル

- `scripts/e2e-auth-flow.mjs`
- `scripts/check-private-api-cache.mjs`
- `scripts/check-private-api-cache.test.mjs`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_132.md`
