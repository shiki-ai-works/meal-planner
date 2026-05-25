# 超献立プランナー 開発進捗 #43

> **画像 URL SQL のファイル出力導線** — 2026-05-25

前回で SQL の実行結果は見えるようになった。今回は、その SQL を画面表示だけでなく、migration（データベース変更ファイル）として保存できる導線を足した。水路図を口頭で伝えるより、図面として残すほうが後の人も迷わない、という寸法だな。

---

## 何をやったか

### Step 1: `--output <file>` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

使い方:

```powershell
npm.cmd run recipe-images:sql-strict -- --output supabase\migrations\007_recipe_images.sql supabase\recipe-images.actual.json
```

`--output` を指定すると、生成 SQL を標準出力ではなくファイルへ書き出す。標準出力とは、コマンド実行結果として画面に表示される出力のことだ。

### Step 2: 既存ファイルの上書きを防止

既に同じ出力ファイルがある場合は、既定で停止する。意図して置き換える場合だけ `--force` を使う。

```powershell
npm.cmd run recipe-images:sql-strict -- --output supabase\migrations\007_recipe_images.sql --force supabase\recipe-images.actual.json
```

### Step 3: SQL 生成以外では `--output` を拒否

`--check`、`--print-template`、`--check-generated-template` は検査や雛形出力のモードなので、SQL ファイル保存とは混ぜないようにした。役割の違う道具を同じ鞘に押し込めると、のちの事故になるからだ。

### Step 4: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に `--output` と `--force` の使い方を追記し、ROADMAP に PROGRESS_43 として反映した。

---

## 検証

通過:

```powershell
node scripts\generate-recipe-image-sql.mjs --output supabase\.recipe-images-output-test.sql supabase\recipe-images.example.json
node scripts\generate-recipe-image-sql.mjs --output supabase\.recipe-images-output-test.sql --force supabase\recipe-images.example.json
Get-Content -Encoding UTF8 -LiteralPath supabase\.recipe-images-output-test.sql
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:template
npm.cmd run recipe-images:check-generated-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

期待どおり失敗:

```powershell
node scripts\generate-recipe-image-sql.mjs --output supabase\.recipe-images-output-test.sql supabase\recipe-images.example.json
node scripts\generate-recipe-image-sql.mjs --check --output supabase\.recipe-images-output-test-ignored.sql supabase\recipe-images.example.json
```

理由:

- 既存出力ファイルは `--force` なしでは上書きしない
- `--check` と `--output` は併用不可

追加確認:

- 出力 SQL に `updated as (...)` と `status` 列が含まれることを確認
- 一時出力ファイルは検証後に削除

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_43.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` を土台に、実際の画像 URL を入れる manifest を作る。

### 2. `007_recipe_images.sql` を実 URL で生成する

実 URL manifest ができたら、`recipe-images:sql-strict -- --output supabase\migrations\007_recipe_images.sql ...` で migration を作る。

### 3. 実 DB で `updated` を確認する

Supabase SQL Editor で実行し、35 件すべてが `updated` になることを確認する。
