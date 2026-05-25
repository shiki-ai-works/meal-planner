# PROGRESS_75

> **デモ状態サマリー強化** — 2026-05-25

前回、栄養集計を `src/lib/nutrition.ts` の共通 helper に寄せた。今回はその物差しを `/demo` の上部サマリーにも渡し、タブを開く前に「いまの献立がどんな状態か」を読めるようにした。

## やったこと

### Step 1: `/demo` 上部に買い物残数を追加

買い物リスト全体からチェック済みを引いた件数を、上部サマリーに `買い物残` として表示した。

これで買い物タブを開かなくても、残りの作業量が一目で分かる。

### Step 2: `/demo` 上部に平均 kcal を追加

`calculateWeekNutrition()` を `DemoClient` でも使い、外食除外込みの週平均 kcal を上部サマリーに表示した。

`NutritionChart` と同じ計算を使うため、画面ごとに別のそろばんを持たない。

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_75` へ進めた。

## 確認したこと

- `npm run check` が通る
- `/demo` に `買い物残` と `平均kcal` が表示される
- 買い物チェック後、買い物残数が 18 -> 17 に変わる
- 外食切替後、平均 kcal が 1216 -> 1174 に変わる

## 検証コマンド

```powershell
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `/demo` ブラウザ確認 -> pass（サマリー表示、買い物チェック、外食切替を確認）

## 変更ファイル

- `src/app/demo/DemoClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_75.md`
