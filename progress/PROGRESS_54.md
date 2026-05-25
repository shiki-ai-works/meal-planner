# 超献立プランナー 開発進捗 #54

> **画像 migration sync 診断** — 2026-05-25

actual manifest と migration SQL は、鏡と姿のようなものだ。片方だけ新しくなると、見えている像がずれてしまう。今回は `recipe-images:actual-workflow` に、actual manifest と `007_recipe_images.sql` が一致しているかを見る `migration sync` を足した。

---

## 何をやったか

### Step 1: SQL 生成を関数化

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加:

- `buildRecipeImageSql(recipes)`

これまで末尾で直接組み立てていた SQL を関数化し、通常の SQL 出力と workflow の比較処理で同じ生成結果を使えるようにした。

### Step 2: workflow に `migration sync` を追加

表示する状態:

- `not ready`: actual manifest が未完成、または警告・エラーがある
- `missing`: actual manifest は完成しているが migration が無い
- `current`: actual manifest から生成される SQL と既存 migration が一致
- `outdated`: 既存 migration が actual manifest と一致しない

`outdated` の時は、次のように `--force` 付きの再生成を案内する。

```powershell
npm.cmd run recipe-images:actual-migration -- --force
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に `migration sync` の意味を追記し、ROADMAP に PROGRESS_54 として反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:actual-workflow
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:actual-workflow
npm.cmd run recipe-images:actual-migration
npm.cmd run recipe-images:actual-workflow
npm.cmd run recipe-images:actual-migration -- --force
npm.cmd run recipe-images:actual-workflow
npm.cmd run recipe-images:check-generated-template
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

追加確認:

- actual manifest が無い時は初期生成を案内
- 空の actual manifest では `migration sync: not ready`
- 完成した actual manifest で migration が無い時は `migration sync: missing`
- migration 生成後は `migration sync: current`
- actual manifest を変更した後は `migration sync: outdated`
- force 再生成後は `migration sync: current` に戻る
- 検証で作った actual manifest / todo / `007_recipe_images.sql` は削除済み

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_54.md`

---

## 次にやること

### 1. 実 URL の投入方法を決める

手動 URL、AI 生成 + Supabase Storage、一部代表画像から開始、のどれで最初の 35 件を埋めるか決める。

### 2. actual-workflow を作業の起点にする

`migration sync` を見ながら、actual manifest と migration SQL のずれを潰す。

### 3. 実データでブラウザ確認へ進む

画像 URL が入ったら `/recipes`、レシピ詳細、MealCard の表示を実データで確認する。
