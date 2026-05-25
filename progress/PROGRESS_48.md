# 超献立プランナー 開発進捗 #48

> **画像 URL 収集チェックリスト** — 2026-05-25

未入力レシピ名の一覧に加えて、今回は Markdown のチェックリスト形式を出せるようにした。料理名の名簿だけでは、作業の済み未済が見えにくい。チェックボックスがあれば、画像 URL 集めを一つずつ畳んでいける。

---

## 何をやったか

### Step 1: `--missing-markdown` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

`--list-missing-images` と組み合わせると、未入力レシピを Markdown チェックリストで出力する。

直接実行の例:

```powershell
node scripts\generate-recipe-image-sql.mjs --list-missing-images --missing-markdown --allow-empty --require-seed-recipes supabase\recipe-images.template.json
```

`--missing-markdown` は missing 一覧専用なので、単独指定した場合はエラーにした。

### Step 2: `recipe-images:missing-md` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:missing-md": "node scripts/generate-recipe-image-sql.mjs --list-missing-images --missing-markdown --allow-empty --require-seed-recipes"
```

使い方:

```powershell
npm.cmd run recipe-images:missing-md -- supabase\recipe-images.template.json
```

出力は次のような形になる。

```markdown
- [ ] 納豆ご飯
- [ ] 卵かけご飯
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に Markdown チェックリスト出力の使い方を追記し、ROADMAP に PROGRESS_48 として反映した。

---

## 検証

通過:

```powershell
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
node scripts\generate-recipe-image-sql.mjs --missing-markdown supabase\recipe-images.template.json
npm.cmd run recipe-images:missing-md -- supabase\recipe-images.example.json
```

理由:

- `--missing-markdown` は `--list-missing-images` 専用
- example manifest は seed coverage error を持つため、チェックリスト表示後に失敗する

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_48.md`

---

## 次にやること

### 1. チェックリストを使って実 URL を集める

`recipe-images:missing-md` の出力を見ながら、未入力レシピへ画像 URL を入れる。

### 2. report で残件数を減らす

`recipe-images:report` が `recipes missing image URLs: 0` になるまで manifest を整える。

### 3. strict migration 生成へ進む

report が `ready for recipe-images:migration: yes` になったら、`recipe-images:migration` を実行する。
