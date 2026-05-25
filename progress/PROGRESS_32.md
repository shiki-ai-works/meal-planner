# 超献立プランナー 開発進捗 #32

> **デモ画面のモバイル栄養タブ改善** — 2026-05-25

`/demo` の携帯幅確認を続け、栄養タブの表示を整えた。PFC の数値は横に詰めると算盤の珠のように見えるが、縦に逃がせば意味が立つ。今回は `NutritionChart` の計算は変えず、狭い画面で読みやすい並びへ寄せた。

---

## 何をやったか

### Step 1: 栄養グラフのヘッダーを携帯幅で縦並びにした

変更:

- `src/components/nutrition-chart/NutritionChart.tsx`

調整:

- 見出しと `1日平均` を携帯幅で縦並び
- `sm` 以上では従来に近い横並び
- コンテナに `min-w-0` を追加

### Step 2: PFC 数値の横詰まりを解消

変更:

- `src/components/nutrition-chart/NutritionChart.tsx`

調整:

- `PFCバランス` と目標値を携帯幅で縦並び
- P/F/C の総量表示を携帯幅で 1 列、`sm` 以上で 3 列

### Step 3: 日別カロリーバーの狭幅耐性を追加

変更:

- `src/components/nutrition-chart/NutritionChart.tsx`

調整:

- バー列に `min-w-0` を追加
- 7 日分のバーが狭い幅でも横に押し広げないようにした

---

## 検証

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
```

ブラウザ確認:

- `http://localhost:3000/demo`
- 表示幅: 319px
- 栄養タブ表示時: 横はみ出しなし
- 栄養カード幅: 約 `280px`
- PFC 数値表示: 携帯幅で 1 列
- 日別カロリーバー: 7 本表示
- `週の栄養` / `1日平均` / `目標` が表示される

---

## 変更ファイル

- `src/components/nutrition-chart/NutritionChart.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_32.md`

---

## 次にやること

### 1. 実データ側のブラウザ確認

`.env.local` が入ったら、ログイン後の `/recipes` / レシピ詳細 / 設定画面を実データで確認する。

### 2. レシピ画像 URL 投入

写真の入口はできているため、`recipes.image_urls` へ実 URL を入れて見た目を仕上げる。

### 3. 設定画面の固定一覧の見通し改善

固定が増えた時に、設定画面の一覧が長くなりすぎないかを確認する。
