# 超献立プランナー 開発進捗 #51

> **実 URL 作業用 manifest の短縮導線** — 2026-05-25

`supabase/recipe-images.actual.json` を作れるようになったので、次はその実作業ファイルを迷わず診断し、残件を見て、本番前検査へ進める道を短くした。細い道でも標識が立てば、夜道の歩みはずいぶん違う。

---

## 何をやったか

### Step 1: actual manifest 用 npm script を追加

変更:

- `package.json`

追加した短縮コマンド:

```json
"recipe-images:actual-report": "node scripts/generate-recipe-image-sql.mjs --report --allow-empty --require-seed-recipes supabase/recipe-images.actual.json",
"recipe-images:actual-missing": "node scripts/generate-recipe-image-sql.mjs --list-missing-images --missing-markdown --allow-empty --require-seed-recipes supabase/recipe-images.actual.json",
"recipe-images:actual-todo": "node scripts/generate-recipe-image-sql.mjs --list-missing-images --missing-markdown --allow-empty --require-seed-recipes --missing-output supabase/recipe-images.todo.md supabase/recipe-images.actual.json",
"recipe-images:actual-check": "node scripts/generate-recipe-image-sql.mjs --check --strict --require-seed-recipes supabase/recipe-images.actual.json",
"recipe-images:actual-migration": "node scripts/generate-recipe-image-sql.mjs --strict --require-seed-recipes --output supabase/migrations/007_recipe_images.sql supabase/recipe-images.actual.json"
```

`actual` は、実 URL を入れていく作業用 manifest を指す目印として使っている。

### Step 2: 作業用ファイルを Git 管理から除外

変更:

- `.gitignore`

追加:

```gitignore
/supabase/recipe-images.actual.json
/supabase/recipe-images.todo.md
```

実 URL の作業中ファイルやチェックリストを、うっかりコミットしないようにした。共有する成果物は、検査を通した後の `007_recipe_images.sql` に寄せる。

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に actual 用コマンドと `.gitignore` 方針を追記し、ROADMAP に PROGRESS_51 として反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:actual-report
npm.cmd run recipe-images:actual-missing
npm.cmd run recipe-images:actual-todo
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

期待どおり失敗:

```powershell
npm.cmd run recipe-images:actual-check
npm.cmd run recipe-images:actual-migration
```

理由:

- 初期生成直後の actual manifest は `image_urls` が空なので、strict 検査では止まる
- strict 検査を通らないため、migration 生成も止まる

追加確認:

- `recipe-images:actual-report` は seed 35 件、未入力 35 件、migration ready `no` を表示
- `recipe-images:actual-missing` は 35 件の Markdown チェックリストを標準出力へ表示
- `recipe-images:actual-todo` は `supabase/recipe-images.todo.md` を保存
- 検証で作った `supabase/recipe-images.actual.json` と `supabase/recipe-images.todo.md` は削除済み

---

## 変更ファイル

- `.gitignore`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_51.md`

---

## 次にやること

### 1. actual manifest に URL を入れる

`npm.cmd run recipe-images:init-actual` で作った `supabase/recipe-images.actual.json` に、実 URL を埋める。

### 2. actual-report / actual-todo で残件を潰す

`recipe-images:actual-report` と `recipe-images:actual-todo` で、空欄の数と料理名を確認しながら作業する。

### 3. actual-check を通して migration へ進む

`recipe-images:actual-check` が通ったら、`recipe-images:actual-migration` で `007_recipe_images.sql` を生成する。
