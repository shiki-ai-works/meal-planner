# PROGRESS_126

> generate-plan no-store coverage 追加 - 2026-05-26

## ねらい

`/api/generate-plan` は、ユーザーの設定、固定枠、在庫、生成された献立に触れる private API だよ。
private API は、成功した時の中身も、失敗した時の理由も、ブラウザや中継 cache に残さないほうが安心できる。

だから今回は、直前の user-data API と同じように `Cache-Control: no-store` を生成 API にもそろえた。

## 変更内容

### Step 1: generate-plan の JSON 応答を no-store 化

`src/app/api/generate-plan/route.ts` に共通 header を追加し、次の応答すべてに `Cache-Control: no-store` を付けた。

- JSON body 不正 `400`
- `weekStartDate` 不正 `400`
- 未ログイン `401`
- profile 不足 `404`
- 初回設定未完了 `428`
- recipe / lock / inventory / save 失敗 `500`
- 献立生成成功 `201`

### Step 2: 公開導線 E2E の header check を拡張

`scripts/e2e-public-flow.mjs` の private API header check を、`/api/user-data/` だけでなく `/api/generate-plan` にも広げた。
fixture server 側も `PRIVATE_API_HEADERS` を使い、未ログイン generate-plan `401` が no-store を返す前提にした。

### Step 3: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、generate-plan の no-store coverage を反映した。

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

- `src/app/api/generate-plan/route.ts`
- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_126.md`
