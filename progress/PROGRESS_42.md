# 超献立プランナー 開発進捗 #42

> **画像 URL SQL の更新結果 status 表示** — 2026-05-25

画像 URL を入れる SQL に、実行後の足跡を残すようにした。SQL は田に水を引く水路のようなもので、流しただけでは、どの畝まで水が届いたか分からないことがある。故に今回は、届いた行を `updated`、届かなかった行を `missing` として返すようにした。

---

## 何をやったか

### Step 1: 生成 SQL の CTE 範囲問題を修正

変更:

- `scripts/generate-recipe-image-sql.mjs`

以前の生成 SQL は、`with image_map ...` のあとに `update` と `select` を別文として出していた。CTE（共通テーブル式、`with` で一時的な表を作る仕組み）は 1 つの SQL 文の中だけ有効なので、後続の確認 `select` から `image_map` を参照できない形だった。

今回、`updated as (...)` を使って `update` と確認 `select` を 1 文にまとめた。

### Step 2: 実行結果に `status` を追加

生成 SQL の確認結果は次のようになる。

- `updated`: `public.recipes` の同名レシピに `image_urls` を更新できた
- `missing`: manifest にある名前が database（データベース）側の `public.recipes` に見つからなかった

`missing` が出た場合は、seed migration（初期データを入れる SQL）の適用漏れ、または manifest の `name` と seed レシピ名の不一致を疑う。

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、Supabase SQL Editor で実行したあとの `updated` / `missing` の読み方を追記した。ROADMAP には PROGRESS_42 として完了項目と現在地を反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:template
npm.cmd run recipe-images:check-generated-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql-strict -- supabase\.recipe-images-sql-status-test.json
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

確認したこと:

- `recipe-images:sql` の出力に `updated as (...)` と `status` 列が含まれる
- `missing` 用の説明コメントが SQL 先頭に出る
- 一時的に 35 件すべてへ `https://images.invalid/...` を入れた manifest で strict SQL 生成が通る
- 一時 manifest は検証後に削除
- `git diff --check` は改行コード警告のみで終了コード 0

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_42.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` を土台に、実際の画像 URL を入れる manifest を作る。

### 2. 画像ソースを決める

AI 生成画像を Supabase Storage に置くか、手動 URL で代表画像から始めるかを決める。

### 3. 実 DB に対して `missing` が出ないか確認する

実 URL manifest から生成した SQL を Supabase SQL Editor で実行し、35 件すべてが `updated` になることを確認する。
