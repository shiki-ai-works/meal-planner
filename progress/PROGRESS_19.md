# 超献立プランナー 開発進捗 #19

> **レシピ割り当ての固定範囲 UI** — 2026-05-24

GitHub の `origin/main` と同期したところ、ローカルは既に最新だった。`.env.local` は無かったため、本物の Supabase データでの確認は次回に回し、今回は手元だけで進められる「今週だけ固定」と「毎週固定」の分離を進めた。

---

## 何をやったか

### Step 1: 固定を 3 モード化

変更:

- `src/components/recipe-assign/RecipeAssignControls.tsx`

追加内容:

- `自由`
- `今週固定`
- `毎週固定`

これまでのチェックボックスは「固定」という一枚看板だった。今回は、鍵を一夜の宿に置くか、毎週の門番に渡すかを分けた形だ。

### Step 2: API で固定範囲を解釈

変更:

- `src/app/api/assign-recipe/route.ts`

追加内容:

- `lockScope: 'none' | 'week' | 'weekly'` を受け取る
- `none` は今週プランに入れるが `*_locked` は立てない
- `week` は今週プランの `*_locked` を立てる
- `weekly` は今週プランを固定しつつ `locked_meals` に upsert する
- 既存の `locked` は API 互換用に残し、未指定時は従来通り `week` として扱う

`locked_meals` は、献立生成エンジンが次回以降の週を作る時に読む毎週固定の表だ。

### Step 3: 表示文言を調整

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`
- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`
- `src/components/recipe-assign/RecipeAssignControls.tsx`

追加内容:

- 「今週に入れる」系の見出しを「献立に入れる」へ寄せた
- レシピ詳細側の説明文を、固定前提ではない表示に変更

---

## 検査

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

補足:

- `git diff --check` は CRLF/LF の予告警告のみで、空白エラーは無し
- Codex Browser で `localhost` / `127.0.0.1` / LAN アドレスを開こうとしたが、いずれも `ERR_BLOCKED_BY_CLIENT` で遮断された
- Next.js 16 の手元ドキュメントで Client Component と Route Handler の扱いを確認済み

---

## 変更ファイル

- `src/components/recipe-assign/RecipeAssignControls.tsx`
- `src/app/api/assign-recipe/route.ts`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_19.md`

---

## 次にやること

### 1. 実データ確認

`.env.local` を用意した環境で以下を確認する。

- `自由` / `今週固定` / `毎週固定` の保存差分
- `locked_meals` へ保存した枠が次回の献立生成に反映されること
- `/recipes` とレシピ詳細の割り当て導線

### 2. 毎週固定の解除・編集 UI

今回の UI は毎週固定の登録まで。既にある `locked_meals` を一覧し、解除・編集する画面は未着手。

### 3. 画像 URL 投入

引き続き `007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
