# 超献立プランナー 開発進捗 #36

> **35 件レシピ画像 manifest 雛形** — 2026-05-25

前回は manifest を検査する秤を作った。今回は、その秤に載せるための皿を 35 件ぶん用意した。まだ画像 URL は空だが、器がそろうと次の作業は「どこに何を注ぐか」だけになる。地図に街道を描く前に、まず国境線を確かめるようなものだな。

---

## 何をやったか

### Step 1: 35 件ぶんの画像 URL 雛形を追加

追加:

- `supabase/recipe-images.template.json`

内容:

- 現在のレシピ 35 件を全件列挙
- 各レシピに `image_urls: []` を用意
- 実 URL を入れる前の作業台として使える形にした

### Step 2: 雛形専用の検査コマンドを追加

変更:

- `package.json`
- `scripts/generate-recipe-image-sql.mjs`

追加:

```json
"recipe-images:check-template": "node scripts/generate-recipe-image-sql.mjs --check --allow-empty supabase/recipe-images.template.json"
```

`--allow-empty` は `--check` 専用にした。SQL 生成で空 URL を通すと、せっかくの画像欄に空白を流し込むことになるためだ。

### Step 3: 空 URL の警告を 1 行に集約

雛形は全件 URL が空なので、35 行の警告が出ると本当に見るべき異常が霞む。そこで `--allow-empty` のときだけ、空 URL の警告を件数サマリにした。

### Step 4: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、雛形の検査コマンドと、実 URL を入れるときの流れを追記した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

確認:

- template manifest は 35 件の mapping として valid
- `--allow-empty` 時の空 URL 警告は 35 行ではなく 1 行サマリ
- example manifest は従来どおり SQL 生成可能
- `example.com` の仮 URL は warning として表示
- `git diff --check` は終了コード 0。CRLF 変換予定の warning のみ

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `supabase/recipe-images.template.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_36.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`supabase/recipe-images.template.json` をコピーし、`image_urls` に実際の `https://...` 画像 URL を入れる。

### 2. 画像ソースを決める

AI 生成画像を Supabase Storage へ置くか、まずは手動 URL で代表画像を入れるかを決める。

### 3. 投入 SQL を実データで確認する

実 URL が入った manifest に対して `recipe-images:check` と `recipe-images:sql` を通し、Supabase SQL Editor で投入する。
