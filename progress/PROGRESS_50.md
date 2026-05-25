# 超献立プランナー 開発進捗 #50

> **実 URL 入力用 manifest 初期生成** — 2026-05-25

画像 URL を入れるには、まず実作業用の manifest が要る。今回は seed から `supabase/recipe-images.actual.json` を安全に作る導線を足した。雛形を手で写すより、同じ種から器を作るほうがずれにくい。

---

## 何をやったか

### Step 1: `--template-output <file>` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

`--template-output` は seed レシピから空の `image_urls` manifest をファイルへ書き出す。既存ファイルは `--force` なしでは上書きしない。

直接実行の例:

```powershell
node scripts\generate-recipe-image-sql.mjs --template-output supabase\recipe-images.actual.json
```

### Step 2: `recipe-images:init-actual` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:init-actual": "node scripts/generate-recipe-image-sql.mjs --template-output supabase/recipe-images.actual.json"
```

使い方:

```powershell
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:init-actual -- --force
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に実 URL 入力用 manifest の初期生成手順を追記し、ROADMAP に PROGRESS_50 として反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:init-actual -- --force
npm.cmd run recipe-images:template
npm.cmd run recipe-images:check-generated-template
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:report -- supabase\recipe-images.template.json
npm.cmd run recipe-images:missing-md-file -- supabase\recipe-images.template.json
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

期待どおり失敗:

```powershell
npm.cmd run recipe-images:init-actual
node scripts\generate-recipe-image-sql.mjs --template-output supabase\.recipe-images-template-output-test.json supabase\recipe-images.template.json
```

理由:

- 既存の `supabase/recipe-images.actual.json` は `--force` なしで上書きしない
- `--template-output` は manifest path を受け取らない

追加確認:

- 生成された `supabase/recipe-images.actual.json` は seed 35 件と空の `image_urls` を含む
- 検証で作った `supabase/recipe-images.actual.json` は削除済み

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_50.md`

---

## 次にやること

### 1. 実 URL を入れる

`recipe-images:init-actual` で作った `supabase/recipe-images.actual.json` に画像 URL を入れる。

### 2. report / missing で残件数を見る

`recipe-images:report` と `recipe-images:missing` で空欄を潰す。

### 3. strict migration 生成へ進む

report が `ready for recipe-images:migration: yes` になったら、`recipe-images:migration` を実行する。
