# 超献立プランナー 開発進捗 #18

> **レシピ図鑑の PFC / kcal フィルタ** — 2026-05-24

PROGRESS_17 で在庫起点の探索を強くしたので、今回は健康目的の探索を足した。レシピ図鑑で kcal 上限と PFC 条件を選び、「今日は軽め」「たんぱく質を寄せたい」「脂質や炭水化物を控えたい」という探し方ができるようになった。

---

## 何をやったか

### Step 1: PFC 判定ロジックを `lib` 化

追加:

- `src/lib/nutrition.ts`

追加内容:

- `getPfcRatio` で PFC の kcal 比率を計算
- `matchesNutritionMode` で以下を判定
  - `highProtein`: たんぱく質 20g 以上、または P 比率 24% 以上
  - `lowFat`: F 比率 25% 以下
  - `lowCarbs`: C 比率 45% 以下

PFC は Protein / Fat / Carbohydrate、つまりたんぱく質・脂質・炭水化物の三つ巴だ。数字の羅針盤として、ひとまずレシピ探索に使いやすい閾値にした。

### Step 2: `/recipes` に kcal 上限を追加

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- `400 kcal以内`
- `600 kcal以内`
- `800 kcal以内`

調理時間やジャンルと同じく、一覧の絞り込み条件として効く。

### Step 3: `/recipes` に PFC 条件を追加

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- `P多め`
- `F控えめ`
- `C控えめ`

複数選択時は AND 条件。たとえば `P多め` と `F控えめ` を同時に選ぶと、両方を満たすレシピだけが残る。

### Step 4: カードに PFC 比率を表示

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- カードの栄養バッジに `PFC 24/28/48` のような kcal 比率を表示
- 上部統計に、栄養条件が有効な時だけ `栄養条件 N 件` を表示

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

- `src/lib/nutrition.ts`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_18.md`

---

## 次にやること

### 1. 実データ確認

本物の Supabase env で以下を確認する。

- kcal 上限
- PFC 条件
- 表記ゆれ在庫一致
- 在庫順ソート
- クイック追加後 toast の `献立を見る`
- dashboard 反映

### 2. 画像 URL 投入

UI 側の受け皿はできているため、35 件分の画像 URL をどう用意するか決めて `007_recipe_images.sql` へ進める。

### 3. 固定 UI の整理

「今週だけ固定」と「毎週固定（locked_meals）」を分ける UI を検討する。
