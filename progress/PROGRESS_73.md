# PROGRESS_73

> **栄養計算の外食除外** — 2026-05-25

買い物リストは外食枠を材料計算から外していた。一方で栄養グラフは recipe id だけを見ていたため、外食に切り替えた食事の栄養が残る可能性があった。今回はこの差を揃えた。帳簿の片方だけ赤線を引いても、もう片方に数字が残っていては勘定が合わない。

## やったこと

### Step 1: `NutritionChart` に外食キーを追加

`src/components/nutrition-chart/NutritionChart.tsx` に、食事枠と対応する外食フラグを持たせた。

```ts
is_eating_out_breakfast
is_eating_out_lunch
is_eating_out_dinner
```

### Step 2: 外食枠を栄養合計から除外

`calcDay()` で、該当する `is_eating_out_*` が `true` の場合は recipe id が残っていても栄養に加算しないようにした。

買い物リストの `buildShoppingList()` と同じ考え方に揃えた形だ。

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_73` へ進めた。

## 確認したこと

- `NutritionChart` が外食枠を栄養合計から除外する
- `npm run check` が通る
- `/demo` の栄養タブが開ける
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

- `src/components/nutrition-chart/NutritionChart.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_73.md`
