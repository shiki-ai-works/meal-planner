# 超献立プランナー 開発進捗 #11

> **Codex への引き継ぎ環境構築 + lint 修正 + 次タスク整理** — 2026-05-23

GitHub の `ROADMAP.md` から開発を引き継ぐため、最新 `main` を `D:\Codex\meal-planner` に clone し、依存関係・検査・次タスクを確認した。ROADMAP は `PROGRESS_08` 時点で止まっていたが、実際の `main` には `PROGRESS_09` と `PROGRESS_10` が含まれていたため、現状に合わせて更新した。

---

## 何をやったか

### Step 1: リポジトリ取得と現状確認

- GitHub: `https://github.com/shiki-ai-works/meal-planner`
- 作業ディレクトリ: `D:\Codex\meal-planner`
- 最新 HEAD: `ceba250 Add 外食オーバーライド UI (長押しトグル) + PROGRESS_10`
- `D:\projects\meal-planner` はこの環境には存在しなかったため、`D:\Codex` 側に clone した

`PROGRESS_09/10` により、ROADMAP の旧 Next 項目のうち以下は完了済みだった。

- 常備品テンプレート UI
- 消費判定の手動オーバーライド / 外食スキップ UI

残る ROADMAP Next は **レシピ画像対応**。

### Step 2: 依存関係の導入

PowerShell の実行ポリシーにより `npm.ps1` が止まったため、Windows 用の `npm.cmd` を使用した。

最初の `npm ci` は sandbox の npm registry 接続制限や `ECONNRESET` で失敗したが、最終的に以下で依存関係を導入できた。

```powershell
npm.cmd install --cache .npm-cache --no-audit --no-fund --prefer-offline --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
```

一時キャッシュ `.npm-cache` は削除済み。`node_modules` は残している。

### Step 3: 検査

以下は通過。

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
```

`next build` は Next.js 16.2.6 / Turbopack で成功し、動的ページも含めてビルドできた。

### Step 4: lint 修正

`npm.cmd run lint` で `src/app/(main)/shopping/ShoppingClient.tsx` の `react-hooks/set-state-in-effect` が 2 件出た。

原因:

- `useEffect` 内で `localStorage` から復元して `setInBasket`
- `useEffect` 内で消費済み item を外すため `setInBasket`

修正:

- `localStorage` のカゴ状態を React state ではなく外部ストアとして扱う
- `useSyncExternalStore` で `storage` event と同一タブ用 custom event を購読
- 消費済み item の自動除外は `localStorage` への保存 + custom event 通知に変更

変更ファイル:

- `src/app/(main)/shopping/ShoppingClient.tsx`

### Step 5: dev server 確認

前面実行では dev server が正常起動することを確認。

```powershell
npm.cmd run dev
```

確認結果:

```text
Local: http://localhost:3000
Ready in 308ms
```

ただし、この Codex 環境で hidden background 起動すると Next dev がすぐ終了する挙動があった。ブラウザ確認が必要な場合は、前面実行または Codex app 側の常駐ターミナルで起動するのがよい。

---

## 現在の状態

```text
作業ディレクトリ: D:\Codex\meal-planner
Git: main...origin/main
未コミット変更:
  M ROADMAP.md
  M src/app/(main)/shopping/ShoppingClient.tsx
  A progress/PROGRESS_11.md
検査:
  TypeScript: pass
  ESLint: pass
  Build: pass
```

`.env.local` は未作成。Supabase 実データでのブラウザ動作確認には `.env.example` に従って以下が必要。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 次にやること

### 1. 今回の引き継ぎ変更を確認して commit

対象:

- `ROADMAP.md`
- `progress/PROGRESS_11.md`
- `src/app/(main)/shopping/ShoppingClient.tsx`

### 2. レシピ画像対応

現在:

- `recipes.image_urls` カラムは存在
- `MealCard` は `recipe.image_urls?.[0]` を背景に使える
- DB 側の URL 投入とレシピ詳細ページのヒーロー画像表示が未実装

設計候補:

- 画像ソースを決める
  - AI 生成画像を Supabase Storage に保存
  - 既存の画像 URL を手動指定
- `supabase/migrations/007_recipe_images.sql` を追加
- `/recipes/[id]` にヒーロー画像を表示
- 画像がない場合の fallback は現在の cuisine emoji 表示を継続

### 3. CodeGraph

`D:\Codex\meal-planner` には `.codegraph/` が無く、CodeGraph は未初期化だった。構造調査を高速化するなら、次回 `codegraph init -i` を実行して index を作る。

---

## 注意点

- `npm` は PowerShell ではなく `npm.cmd` を使うと安定する
- `npm ci` はネットワーク切断に弱かったため、今回の環境では `npm install --prefer-offline` が通った
- `npm ls --depth=0` は exit 0 だが、一部 optional 系 package が `extraneous` 表示になる。検査と build には影響なし
- ROADMAP の古い Now / Next は PROGRESS_09/10 を反映して更新済み
