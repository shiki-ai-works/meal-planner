# 超献立プランナー 開発進捗 #17

> **レシピ図鑑の在庫ゆる一致 + 作れそうスコア** — 2026-05-24

PROGRESS_16 で入れた在庫一致は完全一致だけだった。今回はその判定を小さな共通ロジックへ切り出し、「鶏もも肉」と「鶏肉」、「玉ねぎ」と「玉葱」のような表記ゆれにも届くようにした。あわせて、レシピ図鑑で「在庫に近い順」に並べ、今ある材料でどれくらい作れそうかを見られるようにした。

---

## 何をやったか

### Step 1: 在庫一致ロジックを `lib` 化

追加:

- `src/lib/ingredient-match.ts`

追加内容:

- 食材名を trim + lowercase + NFKC + 記号除去で正規化
- 肉、卵、野菜、米、牛乳、魚、麺などの表記ゆれ辞書を追加
- 完全一致、辞書一致、部分一致の順で在庫を判定
- `調味料` カテゴリは「作れそう」スコアの母数から除外
- `matchedCount / targetCount / score / 不足食材` を返す `getRecipeInventoryMatch` を追加

完全一致の一本橋から、辞書と部分一致を添えた石畳にした格好。

### Step 2: レシピ図鑑に作れそうスコアを表示

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- レシピごとの在庫一致結果を `useMemo` で事前計算
- カードに `在庫 2/5` のような一致数 / 対象数を表示
- カードに `80%` のような作れそうスコアを表示
- 足りない主材料の先頭 2 件を `あと 玉ねぎ・牛乳` のように表示
- 上部統計に `作れそう N 件` を追加

### Step 3: 在庫起点で探せる操作を追加

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- 並び順セレクトに `在庫順` を追加
- `在庫一致あり` チェックで、在庫に触れているレシピだけに絞り込み

「料理名から探す」だけでなく、「冷蔵庫から献立へ向かう」道が少し太くなった。

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

- `src/lib/ingredient-match.ts`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_17.md`

---

## 次にやること

### 1. PFC / kcal フィルタ

レシピ図鑑で健康目的の探索を強くする。

- kcal 上限
- たんぱく質多め
- 脂質控えめ
- 炭水化物控えめ

### 2. 実データ確認

本物の Supabase env で以下を確認する。

- 表記ゆれ在庫一致
- 在庫順ソート
- 在庫一致あり絞り込み
- クイック追加後 toast の `献立を見る`
- dashboard 反映

### 3. 画像 URL 投入

UI 側の受け皿はできているため、35 件分の画像 URL をどう用意するか決めて `007_recipe_images.sql` へ進める。
