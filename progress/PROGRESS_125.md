# PROGRESS_125

> user-data API no-store E2E coverage 追加 - 2026-05-26

## ねらい

個人データの export / delete API は、成功時だけでなく失敗時の返事も保存されないほうが安全だよ。
`Cache-Control: no-store` は、ブラウザや中継 cache に「この応答は覚えないで」と伝える印みたいなもの。

今回は user-data 系 API の `400` / `401` / `500` 応答で、この印が抜けないようにそろえた。

## 変更内容

### Step 1: user-data API の no-store を統一

`/api/user-data/export` では、未ログイン `401` と export 失敗 `500` に `Cache-Control: no-store` を追加した。
成功時の JSON export にはすでに `no-store` があったので、同じ定数を使うようにした。

`/api/user-data/delete` では、確認 header 不足 `400`、未ログイン `401`、削除失敗 `500`、成功 `200` のすべてで同じ `no-store` header を返すようにした。

### Step 2: 公開導線 E2E で header も確認

`scripts/e2e-public-flow.mjs` の API status check に header 確認を追加した。
`/api/user-data/` 配下の API については、`Cache-Control: no-store` が無いと失敗する。

fixture server 側も同じ header を返すようにして、`e2e:public:test` で自己検査できるようにした。

### Step 3: 文書を更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、user-data API の no-store 確認を反映した。

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

- `src/app/api/user-data/export/route.ts`
- `src/app/api/user-data/delete/route.ts`
- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_125.md`
