# PROGRESS_130

> private API no-store negative E2E self-test 追加 - 2026-05-26

## ねらい

`private-api:cache` はコードの形を読む静的チェックだよ。
でも、公開導線 E2E の header check が実際に失敗を拾うかも、自己検査で見ておきたい。

今回は fixture server から private API の `cache-control` をわざと外す negative case を追加した。
negative case は「壊したらちゃんと壊れたとわかるか」を確認する検査だね。

## 変更内容

### Step 1: fixture で private API header を外せるようにした

`scripts/e2e-public-flow.test.mjs` に `omitPrivateApiCacheHeader` option を追加した。
通常の fixture はこれまで通り `cache-control: no-store` を返す。

### Step 2: header 欠落時の失敗を確認

`startFixtureServer({ omitPrivateApiCacheHeader: true })` で仮サーバーを起動し、`e2e-public-flow.mjs` が次のエラーで失敗することを確認する。

```text
/api/generate-plan returned cache-control: <missing>, expected no-store
```

これで、公開導線 E2E の no-store header check が実際に効いていることを自己検査できる。

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

- `scripts/e2e-public-flow.test.mjs`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_130.md`
