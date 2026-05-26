# PROGRESS_127

> private mutation API coverage 追加 - 2026-05-26

## ねらい

`/api/assign-recipe` と `/api/weekly-locks/[id]` は、献立を変更する private API だよ。
画面から使うときはログイン済みだけれど、API は扉そのものだから、未ログインで直接叩かれた時の挙動も起動後に確認しておきたい。
さらに初回設定が終わっていないユーザーが、画面 guard を飛び越えて変更 API だけを叩けないようにする必要がある。

今回はレシピ割り当て、毎週固定 PATCH / DELETE の未ログイン guard と `Cache-Control: no-store` を公開導線 E2E に乗せた。
`no-store` は、ブラウザや中継 cache に応答を保存させない指定だよ。

## 変更内容

### Step 1: private mutation API の no-store と初回設定 guard を統一

`src/app/api/assign-recipe/route.ts` の全 JSON 応答に `Cache-Control: no-store` を付け、`onboarding_completed_at` が無い場合は `428` で止めるようにした。
`src/app/api/weekly-locks/[id]/route.ts` も PATCH / DELETE の前に同じ初回設定 guard を見るようにした。

- request body 不正 `400`
- 入力 validation `400`
- 未ログイン `401`
- 初回設定未完了 `428`
- not found `404`
- duplicate `409`
- database 失敗 `500`
- 更新 / 削除成功

### Step 2: 公開導線 E2E に PATCH / DELETE を追加

`scripts/e2e-public-flow.mjs` で、未ログインの次の導線を確認するようにした。

- `POST /api/assign-recipe` -> `401 Unauthorized`
- `PATCH /api/weekly-locks/public-e2e-lock` -> `401 Unauthorized`
- `DELETE /api/weekly-locks/public-e2e-lock` -> `401 Unauthorized`

private API header check の対象にも `/api/assign-recipe` と `/api/weekly-locks/` を追加したので、どちらも `Cache-Control: no-store` が無いと失敗する。

### Step 3: fixture と文書を更新

`e2e:public:test` の fixture server に assign-recipe / weekly-locks 応答を追加し、README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に反映した。
`onboarding:schema` も assign-recipe / weekly-locks の初回設定 guard を確認するようにした。

## 検証

```powershell
npm.cmd run e2e:public:test
npm.cmd run docs:progress-index
npm.cmd run docs:links
npm.cmd run check
npm.cmd run release:check
git diff --check
```

すべて pass。

## 変更ファイル

- `src/app/api/weekly-locks/[id]/route.ts`
- `src/app/api/assign-recipe/route.ts`
- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `scripts/check-onboarding-schema.mjs`
- `scripts/check-onboarding-schema.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_127.md`
