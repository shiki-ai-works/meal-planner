# 超献立プランナー 開発進捗 #16

> **クイック追加後の「献立を見る」toast action + 在庫一致表示** — 2026-05-24

PROGRESS_15 のレシピ図鑑クイック追加に、追加後の次アクションと在庫の手がかりを足した。検索して料理を見つけるだけでなく、「家にある材料に近い」「追加したあと献立へすぐ戻れる」が分かる。

---

## 何をやったか

### Step 1: `/recipes` に在庫名を渡す

変更:

- `src/app/(main)/recipes/page.tsx`

`recipes` と一緒に `inventory.ingredient_name` を取得し、`RecipesClient` へ `inventoryNames` として渡すようにした。

### Step 2: 在庫一致数を表示

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- 食材名と在庫名を NFKC + lowercase で正規化
- レシピ材料と在庫名を突き合わせ
- 一致する材料数をカードに `在庫 N` として表示
- 絞り込み後のレシピ中、在庫一致がある件数を上部に表示

現状は完全一致ベース。将来「鶏もも肉」と「鶏肉」などのゆるい一致を入れる余地あり。

### Step 3: クイック追加後 toast action

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

クイック追加成功時、画面下部に toast を出す。

- 追加したレシピ名
- 追加先メッセージ
- `献立を見る` リンク
- 閉じるボタン
- 4.5 秒で自動消去

これで「追加できたが、次にどこを見るのか」が迷子になりにくい。

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

- `src/app/(main)/recipes/page.tsx`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_16.md`

---

## 次にやること

### 1. 在庫一致の精度改善

現在は完全一致。次の改善候補:

- 部分一致
- 表記ゆれ辞書
- カテゴリ一致も見る
- 「在庫だけで作れそう」スコア

### 2. PFC / kcal フィルタ

レシピ図鑑に以下を追加すると、健康目的の探索が強くなる。

- kcal 上限
- たんぱく質多め
- 脂質控えめ
- 炭水化物控えめ

### 3. 実データ確認

本物の Supabase env で以下を確認する。

- 在庫一致数
- クイック追加
- toast の `献立を見る`
- dashboard 反映
