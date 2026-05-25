# 超献立プランナー 開発進捗 #12

> **レシピ画像 UI 対応 + レシピ詳細 GUI 改善** — 2026-05-23

ROADMAP の残タスク「レシピ画像対応」に着手し、画像 URL が入ったときに MealCard とレシピ詳細が自然に見えるよう UI 側の受け口を整えた。まだ 35 件分の画像 URL 投入は未実施。次は画像ソースを決めて `007_recipe_images.sql` などで DB に入れる。

---

## 何をやったか

### Step 1: CodeGraph 初期化

`D:\Codex\meal-planner` で CodeGraph を初期化。

```powershell
codegraph.cmd init -i
```

結果:

- 40 files indexed
- 289 nodes
- 248 edges

`.codegraph/` はローカル索引なので `.gitignore` に追加した。

### Step 2: 料理ジャンルごとの視覚トークン追加

`src/lib/cuisine.ts` に `cuisineBackground()` を追加。

用途:

- レシピ画像がない場合の fallback 背景
- MealCard とレシピ詳細ページの見た目を同じ語彙に揃える

既存の `cuisineBorderColor()` / `fallbackEmoji()` と合わせて、和食・中華・洋食・その他の色表現を共通化した。

### Step 3: MealCard の改善

`src/components/meal-card/MealCard.tsx`

- `recipe.image_urls` の先頭の空でない URL を背景画像に使用
- 画像がない場合は `cuisineBackground()` のジャンル別背景を使用
- hover / focus-visible を追加して、クリック可能なカードとして見えやすくした
- キーボード操作として `Shift+Enter` / `Shift+Space` で外食切替できるようにした
- `aria-label` と `title` を追加

長押し操作はそのまま維持。

### Step 4: レシピ詳細ページのヒーロー化

`src/app/(main)/recipes/[id]/page.tsx`

- レシピ詳細ヘッダーを写真ヒーローに変更
- `recipe.image_urls` があれば写真背景
- 画像がなければジャンル別 gradient + fallback emoji
- 料理名、ジャンル、調理方法、時間、難易度、タグをヒーロー下部へ集約
- 最大幅を `max-w-lg` から `max-w-2xl` へ広げ、詳細画面として余白を確保

### Step 5: レシピ詳細本文の GUI 改善

`src/app/(main)/recipes/[id]/RecipeDetailClient.tsx`

- 人数切替を安定した 3 分割 stepper UI に変更
- 栄養価を kcal/P/F/C の 4 セル表示 + PFC バーに整理
- 材料をスマホ 1 列 / 広め画面 2 列のグリッドに変更
- 手順番号を丸バッジ化
- `RecipeStep.image_url` がある場合、手順内画像を表示

手順画像は将来の任意 URL を受けるため通常の `img` を使用し、Next Image の remote allowlist 設計が固まるまでは行単位で lint warning を抑制している。

### Step 6: ブラウザ確認

本物の `.env.local` が未設定だったため、Supabase の接続はできない。確認のため一時的なダミー `.env.local` を作り、ログイン画面の表示だけ確認した。

確認後、ダミー `.env.local` と一時ログは削除済み。

ブラウザで確認できたこと:

- `/login` が表示される
- Next.js の env 未設定エラーは解消できる

未確認:

- 実 Supabase データでの `/recipes/[id]`
- 実画像 URL を入れた MealCard / レシピ詳細ヒーロー

---

## 検査

すべて通過。

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

---

## 変更ファイル

- `.gitignore`
- `ROADMAP.md`
- `progress/PROGRESS_12.md`
- `src/lib/cuisine.ts`
- `src/components/meal-card/MealCard.tsx`
- `src/app/(main)/recipes/[id]/page.tsx`
- `src/app/(main)/recipes/[id]/RecipeDetailClient.tsx`

PROGRESS_11 からの継続変更:

- `src/app/(main)/shopping/ShoppingClient.tsx`
- `progress/PROGRESS_11.md`

---

## 次にやること

### 1. 画像 URL 投入方針を決める

候補:

- AI 生成画像を 35 件分作り、Supabase Storage に保存
- 代表的な一部レシピだけ先に画像化し、残りは fallback で運用
- 手動で信頼できる URL を用意し、`007_recipe_images.sql` で投入

僕の提案は **一部代表画像から始める** こと。35 件を一気に埋めるより、朝・昼・夜 / 和・洋・中の代表 8-12 件だけ先に入れて、画面の密度と読み込み感を見てから増やす方が事故が少ない。

### 2. 本物の `.env.local` で実データ確認

必要:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

確認対象:

- `/dashboard`
- MealCard の画像背景
- `/recipes/[id]` のヒーロー表示
- 外食トグルと買い物リストの整合

### 3. 次の GUI 改善候補

- レシピ詳細から「この料理を今週に固定」する導線
- MealCard の長押し操作を、初回だけ軽いヒント toast で知らせる
- 買い物リストのカテゴリ折りたたみ
- レシピ検索 / 食材検索の最小 UI
