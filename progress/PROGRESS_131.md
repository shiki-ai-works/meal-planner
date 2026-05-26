# PROGRESS_131

> auth E2E no-store guard 追加 - 2026-05-26

## ねらい

private API の `Cache-Control: no-store` は、公開導線 E2E と静的チェックでかなり守れている。
でも認証付き E2E 側にも、成功系の `assign-recipe` と `user-data export` の header 確認がある。

ここが将来の編集で外れると、実ユーザーの個人データを扱う応答の保存禁止確認が弱くなる。
だから今回は、`private-api:cache` が auth E2E の no-store 確認も見張るようにした。

## 変更内容

### Step 1: auth E2E の header check を静的ガードへ追加

`scripts/check-private-api-cache.mjs` に `scripts/e2e-auth-flow.mjs` の確認を追加した。

確認対象は次の 2 つ。

- `POST /api/assign-recipe` が `Cache-Control: no-store` を確認していること
- `GET /api/user-data/export` が `Cache-Control: no-store` を確認していること

### Step 2: 自己検査の negative case を追加

`scripts/check-private-api-cache.test.mjs` に、auth E2E から user-data export の no-store 確認が消えた場合の失敗ケースを追加した。

negative case は「見張り番が眠っていないか」を確かめる小さな罠みたいなものだよ。
これで、公開導線 E2E と認証付き E2E の両方の header check が通常検査から外れにくくなった。

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

- `scripts/check-private-api-cache.mjs`
- `scripts/check-private-api-cache.test.mjs`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_131.md`
