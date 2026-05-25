# 超献立プランナー 開発進捗 #25

> **デモ画面に買い物リストを追加** — 2026-05-24

前回の `/demo` は、Supabase なしで献立と栄養を見られる状態だった。今回はそこへ買い物リストをつなげた。献立表が献立表のまま止まらず、台所へ持って行ける買い出し札になるようにした。

---

## 何をやったか

### Step 1: デモ用の在庫・常備品を追加

変更:

- `src/lib/demo-data.ts`

追加内容:

- `DEMO_INVENTORY`
- `DEMO_PANTRY_ITEMS`
- `DEMO_WEEK_START_DATE`
- `DEMO_NOW`

実アプリの買い物リストと同じく、在庫分の差し引きと常備品の除外をデモでも確認できるようにした。

### Step 2: 既存の買い物リスト生成をデモへ接続

変更:

- `src/app/demo/DemoClient.tsx`

追加内容:

- `buildShoppingList` を使って、デモ献立から買い物リストを生成
- `CATEGORY_ORDER` に沿ってカテゴリ別に表示
- 外食切替や組み直しに合わせて買い物リストも再計算

新しい計算処理を増やさず、既存の本番用ロジックをデモにも通した。

### Step 3: デモ用チェック操作を追加

変更:

- `src/app/demo/DemoClient.tsx`

追加内容:

- 買い物項目のチェックボックス
- チェック済み件数 `n/total`
- 組み直し・ペルソナ変更時のチェック状態リセット

ローカルだけの操作で、DB 保存は行わない。

---

## 検査

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
```

`next build` では `/demo` が引き続き Static Route として生成された。

---

## ブラウザ確認

確認:

- `http://localhost:3000/demo`
  - `買い物リスト` が表示される
  - `在庫 3 件 / 常備品 3 件を反映` が表示される
  - カテゴリ `青果` が表示される
  - 買い物チェックボックスが 18 件表示される
- 先頭のチェックボックスを押すと `false -> true` に変化
- チェック済み件数が画面上で更新される

---

## 変更ファイル

- `src/lib/demo-data.ts`
- `src/app/demo/DemoClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_25.md`

---

## 次にやること

### 1. デモのレシピ詳細相当を追加

カードから本物の `/recipes/[id]` へ行くと Supabase が必要になる。デモ内で選択レシピの材料・栄養を見られる簡易詳細を足すと、さらに一続きの体験になる。

### 2. 実 Supabase 環境の確認

`.env.local` を入れて、本物の `/dashboard` / `/recipes` / `/settings` を確認する。

### 3. 画像 URL 投入

`007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
