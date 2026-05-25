# 超献立プランナー 開発進捗 #37

> **画像 manifest と seed レシピ名の同期検査** — 2026-05-25

35 件の雛形を作っただけでは、まだ紙の名簿でしかない。レシピ本体が増えたり、名前が変わったりした時に、画像 manifest だけ古いまま残る危険がある。そこで今回は、seed レシピ名との照合を追加した。帳簿と現物を突き合わせる、あの地味だが強い作業だな。

---

## 何をやったか

### Step 1: `--require-seed-recipes` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加内容:

- `supabase/migrations/002_seed_recipes.sql` から 25 件の seed レシピ名を抽出
- `supabase/migrations/005_detailed_recipes.sql` から追加 10 件の seed レシピ名を抽出
- manifest 側の `recipes[].name` と過不足なく一致するか検査
- 足りないレシピ名をエラー化
- seed に存在しない余分なレシピ名をエラー化
- seed 側の重複名もエラー化

seed は初期データのことだ。ここでは「アプリが最初から持つレシピ台帳」と考えればよい。

### Step 2: template 検査に seed coverage を組み込む

変更:

- `package.json`

`recipe-images:check-template` が、雛形の内部検査だけでなく seed レシピ名との一致も見るようになった。

```json
"recipe-images:check-template": "node scripts/generate-recipe-image-sql.mjs --check --allow-empty --require-seed-recipes supabase/recipe-images.template.json"
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、`--require-seed-recipes` の意味と使い方を追記した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
node scripts\generate-recipe-image-sql.mjs --check --allow-empty --require-seed-recipes supabase\recipe-images.template.json
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

確認:

- template manifest は 35 件の seed recipe をすべて cover
- `002_seed_recipes.sql` と `005_detailed_recipes.sql` から合計 35 件を抽出
- example manifest の通常検査は従来どおり通過
- example manifest の SQL 生成も従来どおり通過
- `--allow-empty` による空 URL 警告は 1 行サマリのまま
- `git diff --check` は終了コード 0。CRLF 変換予定の warning のみ

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_37.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest の作成

`supabase/recipe-images.template.json` をコピーし、実 URL を入れる作業用 manifest を作る。

### 2. 画像ソースの決定

AI 生成画像を Supabase Storage に置くか、まず手動 URL で代表画像を入れるかを決める。

### 3. 投入 SQL の実行前検査

実 URL manifest に対して、通常検査と seed coverage 検査を両方通す。
