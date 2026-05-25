# 超献立プランナー 開発進捗 #24

> **Supabase なしで見られるデモ画面** — 2026-05-24

`.env.local` がまだ無い環境では、これまで `/setup` しか見られなかった。今回は、実データベースへ接続しなくても献立画面の姿を確認できる `/demo` を追加した。水道がまだ来ていない家でも、間取りと家具の置き方を見られる模型を置いた形だ。

---

## 何をやったか

### Step 1: デモ用データを追加

追加:

- `src/lib/demo-data.ts`

追加内容:

- 9 件のデモレシピ
- 3 件の毎週固定サンプル
- デモ用の目標カロリー / PFC

デモレシピは `DbRecipe` 型に合わせて作り、既存の `generateWeekPlan` と `NutritionChart` へそのまま渡せるようにした。

### Step 2: `/demo` 画面を追加

追加:

- `src/app/demo/page.tsx`
- `src/app/demo/DemoClient.tsx`

追加内容:

- Supabase API を呼ばずに、クライアント側だけで献立を生成
- ペルソナ選択
- 組み直し
- 栄養グラフ
- 7 日 x 3 食のカード表示
- デモ上だけの外食切替

既存の `MealCard` と `NutritionChart` を再利用した。

### Step 3: MealCard をデモでも使いやすく調整

変更:

- `src/components/meal-card/MealCard.tsx`

追加内容:

- `href?: string | null` を追加
- 通常は従来どおり `/recipes/[id]` へリンク
- `href={null}` の時は、レシピありでも画面遷移しないカードとして表示

これでデモ中にカードを押しても、Supabase が必要な詳細画面へ迷い込まない。

### Step 4: 未設定時でも `/demo` を通す

変更:

- `src/lib/supabase/middleware.ts`

追加内容:

- `/demo` を公開ページとして扱う
- Supabase env が無い時も `/demo` は `/setup` へ戻さない
- Supabase env がある場合も、未ログインで `/demo` を閲覧可能

### Step 5: setup / README から誘導

変更:

- `src/app/setup/page.tsx`
- `README.md`

追加内容:

- `/setup` に「デモを見る」リンクを追加
- README に `http://localhost:3000/demo` を記載

---

## 検査

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
```

`next build` では `/demo` が Static Route として生成された。

---

## ブラウザ確認

確認:

- `http://localhost:3000/demo`
  - Supabase env なしでも表示される
  - `DEMO PREVIEW`
  - `超献立プランナー`
  - `週の栄養`
  - `月曜日`
  - `組み直す`
- `組み直す` ボタン押下後も `/demo` に留まり、献立表示が維持される
- `http://localhost:3000/setup`
  - `デモを見る`
  - `Copy-Item .env.example .env.local`

以上を確認した。

---

## 変更ファイル

- `src/lib/demo-data.ts`
- `src/app/demo/page.tsx`
- `src/app/demo/DemoClient.tsx`
- `src/components/meal-card/MealCard.tsx`
- `src/lib/supabase/middleware.ts`
- `src/app/setup/page.tsx`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_24.md`

---

## 次にやること

### 1. 実 Supabase 環境の確認

`.env.local` を入れて、デモではなく本物の `/dashboard` / `/recipes` / `/settings` を確認する。

### 2. デモの見た目強化

料理画像 URL が入ったら、デモにも写真つきのサンプルを渡す。

### 3. 画像 URL 投入

引き続き `007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
