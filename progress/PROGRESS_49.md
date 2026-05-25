# 超献立プランナー 開発進捗 #49

> **画像 URL 収集チェックリスト保存** — 2026-05-25

前回は Markdown チェックリストを画面に出した。今回は、それをファイルへ保存できるようにした。紙片を机に置いておけると、次に戻った時の手が早い。画像 URL 集めは細かな採集作業だから、残せるチェックリストが効く。

---

## 何をやったか

### Step 1: `--missing-output <file>` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

`--list-missing-images --missing-markdown` と組み合わせると、Markdown チェックリストをファイルへ書き出す。

直接実行の例:

```powershell
node scripts\generate-recipe-image-sql.mjs --list-missing-images --missing-markdown --allow-empty --require-seed-recipes --missing-output supabase\recipe-images.todo.md supabase\recipe-images.template.json
```

`--missing-output` は Markdown missing 一覧専用なので、単独指定した場合はエラーにした。

### Step 2: 上書き保護を追加

既に出力先ファイルがある場合は、既定では止まる。作り直す場合だけ `--force` を使う。

```powershell
npm.cmd run recipe-images:missing-md-file -- --force supabase\recipe-images.template.json
```

### Step 3: `recipe-images:missing-md-file` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:missing-md-file": "node scripts/generate-recipe-image-sql.mjs --list-missing-images --missing-markdown --allow-empty --require-seed-recipes --missing-output supabase/recipe-images.todo.md"
```

使い方:

```powershell
npm.cmd run recipe-images:missing-md-file -- supabase\recipe-images.template.json
```

### Step 4: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README にファイル保存と `--force` の使い方を追記し、ROADMAP に PROGRESS_49 として反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:missing-md-file -- supabase\recipe-images.template.json
npm.cmd run recipe-images:missing-md-file -- --force supabase\recipe-images.template.json
npm.cmd run recipe-images:missing-md -- supabase\recipe-images.template.json
npm.cmd run recipe-images:missing -- supabase\recipe-images.template.json
npm.cmd run recipe-images:report -- supabase\recipe-images.template.json
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
npm.cmd run recipe-images:missing-md-file -- supabase\recipe-images.template.json
node scripts\generate-recipe-image-sql.mjs --missing-output supabase\.recipe-images-missing-output-test.md supabase\recipe-images.template.json
```

理由:

- 既存の `supabase/recipe-images.todo.md` は `--force` なしで上書きしない
- `--missing-output` は `--list-missing-images --missing-markdown` 専用

追加確認:

- 書き出した `supabase/recipe-images.todo.md` は `# Recipe Image URL Checklist` と 35 件のチェックボックスを含む
- 検証で作った `supabase/recipe-images.todo.md` は削除済み

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_49.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` を土台に、実際の画像 URL を入れる manifest を作る。

### 2. チェックリストを実作業に使う

必要に応じて `recipe-images:missing-md-file` で `supabase/recipe-images.todo.md` を生成し、画像収集の進捗管理に使う。

### 3. strict migration 生成へ進む

report が `ready for recipe-images:migration: yes` になったら、`recipe-images:migration` を実行する。
