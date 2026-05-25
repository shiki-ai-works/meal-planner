# 超献立プランナー 開発進捗 #53

> **画像 actual workflow 診断** — 2026-05-25

画像 URL 投入まわりは道具が増えてきた。便利な道具箱も、今どの引き出しを開けるべきか分からなければ少し重たい。今回は `actual` 作業の現在地を一つのコマンドで見られるようにした。

---

## 何をやったか

### Step 1: `--workflow` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加:

```powershell
node scripts\generate-recipe-image-sql.mjs --workflow
```

表示するもの:

- `supabase/recipe-images.actual.json` の有無
- `supabase/recipe-images.todo.md` の有無
- `supabase/migrations/007_recipe_images.sql` の有無
- actual manifest がある場合の URL 入力状況
- 次に実行するコマンド

### Step 2: `recipe-images:actual-workflow` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:actual-workflow": "node scripts/generate-recipe-image-sql.mjs --workflow"
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に workflow の使い方を追記し、ROADMAP に PROGRESS_53 として反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:actual-workflow
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:actual-workflow
npm.cmd run recipe-images:actual-todo
npm.cmd run recipe-images:actual-workflow
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

期待どおり失敗:

```powershell
node scripts\generate-recipe-image-sql.mjs --workflow supabase\recipe-images.template.json
node scripts\generate-recipe-image-sql.mjs --workflow --report
```

理由:

- `--workflow` は actual 作業の状態診断専用なので manifest path を受け取らない
- `--report` など他モードとの併用も拒否する

追加確認:

- actual manifest が無い時は `recipe-images:init-actual` を next actions に表示
- actual manifest がある時は seed 35 件、未入力 35 件、migration ready `no` を表示
- todo が無い時は `recipe-images:actual-todo` を next actions に表示
- todo がある時はチェックリスト作成ではなく URL 入力を促す
- 検証で作った actual manifest と todo は削除済み

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_53.md`

---

## 次にやること

### 1. 実 URL の投入方法を決める

手動 URL、AI 生成 + Supabase Storage、一部代表画像から開始、のどれで最初の 35 件を埋めるか決める。

### 2. actual-workflow を起点に作業する

迷ったら `npm.cmd run recipe-images:actual-workflow` を実行し、表示された next actions の順に進める。

### 3. strict 検査から migration へ進む

URL が埋まったら `recipe-images:actual-check` を通し、`recipe-images:actual-migration` で `007_recipe_images.sql` を生成する。
