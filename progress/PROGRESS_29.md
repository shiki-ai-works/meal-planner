# 超献立プランナー 開発進捗 #29

> **デモ画面のモバイル献立表示改善** — 2026-05-25

`/demo` のタブ整理後、携帯幅で週献立カードが小さく詰まりすぎないように調整した。小さな器に無理に三品を盛るより、一皿ずつ出した方が味が分かる。故に、狭い画面では献立カードを一列に並べ、カード自体も横長にした。

---

## 何をやったか

### Step 1: MealCard の携帯幅を横長に変更

変更:

- `src/components/meal-card/MealCard.tsx`

調整:

- 携帯幅: `aspect-[16/9] min-h-[116px]`
- `sm` 以上: `aspect-square sm:min-h-[120px]`

広い画面では従来の正方形カードを維持する。

### Step 2: /demo の週献立を携帯幅で一列に変更

変更:

- `src/app/demo/DemoClient.tsx`

調整:

- 携帯幅: 1 列
- `sm` 以上: 3 列
- ページ左右余白を携帯幅で少しだけ詰めた

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
- 週献立タブが表示される
- 献立カードが 1 列になる
- 最初のカード寸法が約 `280 x 158px` になる
- `固定` タブへ切り替えられる
- 固定タブ表示時、週献立が隠れ、固定サンプルが表示される

---

## 変更ファイル

- `src/components/meal-card/MealCard.tsx`
- `src/app/demo/DemoClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_29.md`

---

## 次にやること

### 1. デモのレシピ詳細パネルを携帯幅で確認

栄養・材料・手順が小さい画面でも読めるかを確認する。

### 2. 実 Supabase 環境での確認

`.env.local` が入ったら、ログイン後のレシピ図鑑・設定画面・毎週固定 API を実データで確認する。

### 3. レシピ画像 URL 投入

写真の入口はできているため、`recipes.image_urls` へ実 URL を入れて見た目を仕上げる。
