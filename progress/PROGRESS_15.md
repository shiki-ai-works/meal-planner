# 超献立プランナー 開発進捗 #15

> **レシピ図鑑から今週の献立へクイック追加** — 2026-05-24

PROGRESS_14 では「レシピ詳細 → 今週に入れる」だったが、今回はさらに一歩進めて、レシピ図鑑のカードから直接追加シートを開けるようにした。検索して見つけた料理を、詳細ページへ寄り道せず献立に差し込める。

---

## 何をやったか

### Step 1: 追加 UI を共通コンポーネント化

新規:

- `src/components/recipe-assign/RecipeAssignControls.tsx`
- `src/components/recipe-assign/index.ts`

責務:

- 今週の週開始日を算出
- 曜日選択
- 朝 / 昼 / 夜 選択
- 固定チェック
- `/api/assign-recipe` への POST
- 成功 / 失敗メッセージ表示

これまで `RecipeAssignPanel.tsx` にあった処理を共通化した。

### Step 2: 詳細ページの追加パネルを共通部品へ差し替え

変更:

- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`

詳細ページ側は見た目の枠と説明を持ち、実際の曜日・食事・保存処理は `RecipeAssignControls` に任せる形へ整理した。

### Step 3: 図鑑カードからクイック追加

変更:

- `src/app/(main)/recipes/RecipesClient.tsx`

追加内容:

- 各レシピカード右上に「今週へ」ボタン
- 押すと画面下部に追加シートを表示
- シート内で曜日・朝昼夜・固定を選べる
- 保存後、短い遅延でシートを閉じる

カード全体を Link にしたまま中に button を入れると HTML として不自然なため、カードを `article` に変更し、内部に詳細 Link とクイック追加 button を分けた。

---

## 検査

すべて通過。

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

`next build` の route 一覧には引き続き `/api/assign-recipe` が載っている。

---

## 変更ファイル

- `src/components/recipe-assign/RecipeAssignControls.tsx`
- `src/components/recipe-assign/index.ts`
- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_15.md`

---

## 次にやること

### 1. 実 Supabase で導線確認

確認対象:

- `/recipes` で「今週へ」
- クイック追加シート表示
- 保存後に `/dashboard` に反映
- 買い物リストへの反映

### 2. 次の UI 候補

- `/recipes` で在庫と一致する食材数を表示
- PFC / kcal 条件での絞り込み
- クイック追加後に「献立を見る」toast action
- 「今週だけ固定」と「毎週固定」を選び分ける
