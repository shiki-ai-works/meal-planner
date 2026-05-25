# 超献立プランナー 開発進捗 #38

> **seed からの画像 manifest 雛形生成** — 2026-05-25

前回までで、画像 manifest と seed レシピ名の照合はできるようになった。今回はさらに、seed から雛形そのものを出力できるようにした。名簿を手で写すのではなく、元帳から清書を作る。そうすれば、料理が増えた時にも、写し間違いの霧が薄くなるだろう。

---

## 何をやったか

### Step 1: `--print-template` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加内容:

- `supabase/migrations/002_seed_recipes.sql` と `supabase/migrations/005_detailed_recipes.sql` から seed レシピ名を抽出
- 各レシピを `{ "name": "...", "image_urls": [] }` の形に変換
- manifest JSON を標準出力へ出す
- `--print-template` では manifest path を受け取らないようにして、SQL 生成や検査と混ざらないようにした

標準出力とは、コマンドを実行した時に画面へ表示される出力のことだ。

### Step 2: npm script を追加

変更:

- `package.json`

追加:

```json
"recipe-images:template": "node scripts/generate-recipe-image-sql.mjs --print-template"
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、seed から雛形 JSON を出力するコマンドを追記した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:template
node scripts\generate-recipe-image-sql.mjs --print-template
node -e "..."
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

確認:

- `recipe-images:template` は 35 件ぶんの空 `image_urls` manifest を出力
- 生成結果は `supabase/recipe-images.template.json` と一致
- template manifest の seed coverage 検査は通過
- example manifest の検査と SQL 生成は従来どおり通過
- `git diff --check` は終了コード 0。CRLF 変換予定の warning のみ

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_38.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest の作成

`recipe-images:template` の出力を土台に、実際の `https://...` 画像 URL を入れる manifest を作る。

### 2. 画像ソースの決定

AI 生成画像を Supabase Storage に置くか、まず手動 URL で代表画像を入れるかを決める。

### 3. 投入 SQL の実行前検査

実 URL manifest に対して、通常検査と seed coverage 検査を両方通す。
