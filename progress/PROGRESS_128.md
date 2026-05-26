# PROGRESS_128

> method-specific public E2E API logging 追加 - 2026-05-26

## ねらい

公開導線 E2E は、未ログインで private API が止まることを確認している。
ただ、`/api/weekly-locks/[id]` は PATCH と DELETE の両方を同じ path で見るので、ログが同じだとどちらを通したか読み取りにくい。

今回は API check のログに HTTP method を出し、検査結果の見通しを良くした。
method は POST / PATCH / DELETE のような、API に対して何をしたいかを示す動詞だよ。

## 変更内容

### Step 1: API check のログを method 付きにした

`scripts/e2e-public-flow.mjs` の `checkApiStatus` が、次のように method を出す。

```text
ok POST /api/generate-plan 401
ok PATCH /api/weekly-locks/public-e2e-lock 401
ok DELETE /api/weekly-locks/public-e2e-lock 401
```

これで、同じ path でも PATCH と DELETE の両方を確認したことが一目でわかる。

### Step 2: fixture 自己検査も method 別にした

`scripts/e2e-public-flow.test.mjs` の期待値を method 付き出力へ更新した。
weekly-locks は PATCH と DELETE を別々に assert するので、片方が外れた時に自己検査で拾える。

### Step 3: 文書を更新

ROADMAP と NEXT_CHAT_HANDOFF に、method-specific logging を反映した。

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

- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_128.md`
