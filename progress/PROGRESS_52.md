# 超献立プランナー 開発進捗 #52

> **画像 manifest エラー案内改善** — 2026-05-25

actual manifest を Git 管理から外したことで、通常の作業樹では `supabase/recipe-images.actual.json` が無い状態になりやすい。そこで、ファイル不在や JSON 不正の時に Node の stack trace ではなく、次に何をすればよいかを短く示すようにした。

---

## 何をやったか

### Step 1: manifest 読み込みを専用関数に分離

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加:

- `readManifest(filePath)`
- `buildMissingManifestHint(filePath)`
- `normalizePathForMessage(filePath)`

`readFileSync` と `JSON.parse` を直接呼ぶのではなく、読み込み失敗を捕まえて人間向けのメッセージに変換する。

### Step 2: actual manifest 不在時の案内を追加

`supabase/recipe-images.actual.json` が無い場合は、次のように案内する。

```text
Error: manifest file not found: supabase/recipe-images.actual.json
Run npm.cmd run recipe-images:init-actual to create it.
```

### Step 3: JSON / shape エラーを短くした

JSON として壊れている場合は `manifest file is not valid JSON` と表示する。`manifest.recipes` が配列でない場合も、stack trace ではなく `manifest.recipes must be an array` で止める。

### Step 4: UTF-8 BOM を受け流す

PowerShell などで作った JSON に UTF-8 BOM が付く場合がある。BOM はファイル先頭の印で、本文ではない。これを読み込み時に取り除き、正しい JSON ならそのまま検査へ進めるようにした。

---

## 検証

期待どおり失敗:

```powershell
npm.cmd run recipe-images:actual-report
node scripts\generate-recipe-image-sql.mjs --check supabase\.recipe-images-invalid-json-test.json
node scripts\generate-recipe-image-sql.mjs --check supabase\.recipe-images-invalid-shape-test.json
```

通過:

```powershell
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:actual-report
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

追加確認:

- `recipe-images:actual-report` は actual manifest 不在時に `recipe-images:init-actual` を案内
- 壊れた JSON は JSON parse 位置を含む短いエラーで停止
- UTF-8 BOM 付きで `recipes` 配列が無い JSON は、BOM ではなく短い shape エラーで停止
- 検証で作った actual manifest と一時 JSON は削除済み

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_52.md`

---

## 次にやること

### 1. 実 URL の投入方法を決める

手動 URL、AI 生成 + Supabase Storage、一部代表画像から開始、のどれで最初の 35 件を埋めるか決める。

### 2. actual manifest を作って埋める

`recipe-images:init-actual` で `supabase/recipe-images.actual.json` を作り、`recipe-images:actual-report` で残件を見ながら URL を追加する。

### 3. strict 検査から migration へ進む

`recipe-images:actual-check` が通ったら、`recipe-images:actual-migration` で `007_recipe_images.sql` を生成する。
