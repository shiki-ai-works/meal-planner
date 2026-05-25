# 超献立プランナー 開発進捗 #14

> **レシピ詳細から今週の献立へ追加する導線** — 2026-05-24

PROGRESS_13 で作ったレシピ図鑑を、閲覧だけでなく実際の献立編集へつなげた。レシピ詳細から曜日・朝昼夜・固定有無を選び、今週の `meal_plans` に直接保存できる。

---

## 何をやったか

### Step 1: 週プラン helper を共通化

新規:

- `src/lib/week-plan.ts`

追加したもの:

- `getMondayISO()`
- `emptyDay()`
- `emptyWeek()`
- `assignRecipeToWeek()`
- `DAY_LABELS`
- `MEAL_SLOT_LABEL`
- `MealSlot`

既存の `dashboard/page.tsx` と `shopping/page.tsx` にあった `getMondayISO()` 重複を削除し、共通 helper へ寄せた。`WeekCalendar.tsx` の `emptyDay()` / `emptyWeek()` も共通化した。

### Step 2: `/api/assign-recipe` 追加

新規:

- `src/app/api/assign-recipe/route.ts`

POST body:

```json
{
  "recipeId": "uuid",
  "weekStartDate": "YYYY-MM-DD",
  "dayOfWeek": 0,
  "mealType": "dinner",
  "locked": true
}
```

処理:

- 認証ユーザーを確認
- `recipes` に対象レシピが存在するか確認
- 今週の active `meal_plans` を取得
- 既存 plan があれば update
- なければ `emptyWeek()` から新規 insert
- 指定枠へ recipe id をセット
- 外食フラグは false に戻す
- `locked=true` の場合、該当枠を固定

### Step 3: レシピ詳細に追加パネル

新規:

- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`

変更:

- `src/app/(main)/recipes/[id]/page.tsx`

UI:

- 曜日選択（月〜日）
- 食事選択（朝・昼・夜）
- 固定チェックボックス
- 「今週に入れる」ボタン
- 成功 / 失敗メッセージ
- 「献立へ」リンク

レシピの `meal_type` が `any` でなければ、その枠を初期選択にする。`any` の場合は夜を初期値にした。

### Step 4: レシピ図鑑の合図を追加

`src/app/(main)/recipes/RecipesClient.tsx` のカードに「詳細で献立へ」チップを追加。図鑑から詳細へ入ると献立追加できることを示した。

---

## 検査

すべて通過。

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

`next build` の route 一覧に `/api/assign-recipe` が追加されていることも確認した。

---

## 変更ファイル

- `src/lib/week-plan.ts`
- `src/app/api/assign-recipe/route.ts`
- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`
- `src/app/(main)/recipes/[id]/page.tsx`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/app/(main)/dashboard/WeekCalendar.tsx`
- `src/app/(main)/shopping/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_14.md`

---

## 次にやること

### 1. 本物の Supabase で実動作確認

確認対象:

- レシピ詳細で「今週に入れる」
- `/dashboard` に反映されるか
- 固定状態が MealCard に出るか
- 買い物リストに反映されるか

### 2. 図鑑から直接クイック追加

現在は「図鑑 → 詳細 → 今週に入れる」。次の改善として、図鑑カードからミニパネルを開いて直接追加できると速い。ただしカード UI が重くなるため、まず詳細導線を実データで確認してからがよい。

### 3. locked_meals との関係整理

今回の固定は `meal_plans.plan` 内の `*_locked` を立てる方式。`locked_meals` テーブルにも永続固定枠があるため、将来「毎週この枠に固定」と「今週だけ固定」を分ける UI を設計すると良い。
