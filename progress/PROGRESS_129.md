# PROGRESS_129

> private API cache guard check 追加 - 2026-05-26

## ねらい

private API の `Cache-Control: no-store` は、今回かなり広くそろえた。
でも、人が後で route を直した時に header を付け忘れることはある。

だから今回は、起動後 E2E だけに頼らず、コードの形を読む静的チェックも追加した。
静的チェックは、アプリを動かす前に「この部品が外れていないか」を見る検査だよ。

## 変更内容

### Step 1: private API cache guard を追加

`scripts/check-private-api-cache.mjs` を追加し、次の route の `NextResponse.json` が no-store header を使うことを確認するようにした。

- `/api/generate-plan`
- `/api/assign-recipe`
- `/api/weekly-locks/[id]`
- `/api/user-data/export`
- `/api/user-data/delete`

user-data 系は `src/lib/user-data.ts` の `USER_DATA_RESPONSE_HEADERS` が `Cache-Control: no-store` を持つことも確認する。

### Step 2: 公開 E2E 側の header check も検査

`scripts/e2e-public-flow.mjs` が private API に `cache-control: no-store` を期待していることを確認するようにした。
fixture 側の `scripts/e2e-public-flow.test.mjs` も、private API 用 header を持つことを確認対象にした。

### Step 3: 自己検査と npm script を追加

`scripts/check-private-api-cache.test.mjs` を追加し、次のケースを確認した。

- 正しい配線は pass
- route の `NextResponse.json` から header が外れたら fail
- 公開 E2E の weekly-locks header check が外れたら fail
- user-data の header が cacheable な値へ戻ったら fail

`private-api:cache` / `private-api:cache:test` を `package.json` に追加し、`npm run check` に組み込んだ。

## 検証

```powershell
npm.cmd run private-api:cache:test
npm.cmd run private-api:cache
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
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_129.md`
