# 超献立プランナー 開発進捗 #44

> **画像 URL migration 生成コマンド** — 2026-05-25

前回までで、画像 URL SQL はファイルへ保存できるようになった。今回は、その保存先を毎回打たずに済む短縮コマンドを足した。よい道具は、正しい所作を面倒にしない。故に `recipe-images:migration` という入口を作った。

---

## 何をやったか

### Step 1: `recipe-images:migration` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:migration": "node scripts/generate-recipe-image-sql.mjs --strict --require-seed-recipes --output supabase/migrations/007_recipe_images.sql"
```

使い方:

```powershell
npm.cmd run recipe-images:migration -- supabase\recipe-images.actual.json
```

このコマンドは、strict（厳格）検査と seed レシピ照合を通った manifest だけ、`supabase/migrations/007_recipe_images.sql` へ書き出す。

### Step 2: `--force` で意図した上書きを可能にする

既存の `007_recipe_images.sql` がある場合は止まる。作り直す時だけ、次のように `--force` を付ける。

```powershell
npm.cmd run recipe-images:migration -- --force supabase\recipe-images.actual.json
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には短縮コマンドと `--force` の使い方を追記し、ROADMAP には PROGRESS_44 として現在地を反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:migration -- supabase\.recipe-images-migration-test.json
npm.cmd run recipe-images:migration -- --force supabase\.recipe-images-migration-test.json
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
npm.cmd run recipe-images:migration -- supabase\.recipe-images-migration-test.json
```

理由:

- 既に `supabase/migrations/007_recipe_images.sql` がある状態では、`--force` なしの上書きを拒否する

追加確認:

- 一時 manifest は 35 件すべてに `https://images.invalid/...` を入れて strict 条件を満たした
- 検証で作った `007_recipe_images.sql` と一時 manifest は削除した

---

## 変更ファイル

- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_44.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` を土台に、実際の画像 URL を入れる manifest を作る。

### 2. `recipe-images:migration` を実 URL で通す

実 URL manifest ができたら、`supabase/migrations/007_recipe_images.sql` を生成する。

### 3. 実 DB で `updated` を確認する

Supabase SQL Editor で実行し、35 件すべてが `updated` になることを確認する。
