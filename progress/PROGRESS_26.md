# 超献立プランナー 開発進捗 #26

> **デモ画面のレシピ詳細パネル** — 2026-05-24

前回までで `/demo` は、献立・栄養・買い物リストまで見られるようになった。今回は献立カードから料理の中身を覗けるようにした。献立表の一品が、ただの名前ではなく、材料・栄養・手順を持つ料理として立ち上がる。

---

## 何をやったか

### Step 1: MealCard に任意の選択コールバックを追加

変更:

- `src/components/meal-card/MealCard.tsx`

追加内容:

- `onSelect?: () => void`
- `href={null}` のカードをクリックした時に `onSelect` を呼ぶ
- 長押しで外食切替した直後は、詳細を開かない

通常のレシピカードは従来どおり `/recipes/[id]` へリンクする。デモだけ、画面遷移せず詳細パネルを開く形にした。

### Step 2: `/demo` に詳細パネルを追加

変更:

- `src/app/demo/DemoClient.tsx`

追加内容:

- 選択中レシピ state
- `DemoRecipeDetail`
- `RECIPE DETAIL` パネル
- 栄養サマリー
- PFC バー
- 材料一覧
- 手順一覧
- タグ表示
- `Escape` キーで閉じる

本物のレシピ詳細ページは Supabase を前提にするため、デモでは小さな独立パネルとして実装した。

---

## 検査

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
```

---

## ブラウザ確認

確認:

- `http://localhost:3000/demo`
- 献立カード「納豆ご飯」をクリック
- `RECIPE DETAIL` が表示される
- `納豆`
- `栄養`
- `材料`
- `手順`
- `閉じる`

以上が表示され、`閉じる` ボタンでパネルが閉じることを確認した。

---

## 変更ファイル

- `src/components/meal-card/MealCard.tsx`
- `src/app/demo/DemoClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_26.md`

---

## 次にやること

### 1. デモの固定枠編集相当

本番の設定画面では毎週固定を編集できる。デモにも「固定サンプルを曜日・食事枠ごとに見せる」小さな一覧を置くと、機能の全体像がさらに伝わる。

### 2. 実 Supabase 環境の確認

`.env.local` を入れて、本物の `/dashboard` / `/recipes` / `/settings` を確認する。

### 3. 画像 URL 投入

`007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
