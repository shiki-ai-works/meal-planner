# PROGRESS_74

> **栄養集計 helper 共通化** — 2026-05-25

前回、`NutritionChart` は外食枠を栄養合計から外すようになった。今回はその計算を `src/lib/nutrition.ts` に移し、画面の中だけに閉じたそろばんを共通の物差しへ変えた。

## やったこと

### Step 1: 栄養集計 helper を追加

`src/lib/nutrition.ts` に次を追加した。

```ts
calculateDayNutrition()
calculateWeekNutrition()
```

どちらも `is_eating_out_*` が立っている食事枠を栄養合計から除外する。

### Step 2: `NutritionChart` を helper 利用へ変更

`src/components/nutrition-chart/NutritionChart.tsx` の内部集計を削り、`calculateWeekNutrition()` を呼ぶ形にした。

PFC 比率も既存の `getPfcRatio()` を使うため、レシピ詳細や検索条件と同じ計算に寄せられる。

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_74` へ進めた。

## 確認したこと

- `npm run check` が通る
- `/demo` の栄養タブが開ける
- 外食切替後、栄養平均が下がる
- `/setup` は引き続き開ける

## 検証コマンド

```powershell
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/demo` ブラウザ確認 -> pass（栄養タブ表示、外食切替後に 1 日平均 kcal が 1216 -> 1127 へ低下）
- `/setup` ブラウザ確認 -> pass（`SETUP REQUIRED` と診断 JSON 導線を確認）

## 変更ファイル

- `src/lib/nutrition.ts`
- `src/components/nutrition-chart/NutritionChart.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_74.md`
