# 超献立プランナー 開発進捗 #23

> **毎週固定の曜日・食事枠移動** — 2026-05-24

毎週固定は、これまで「中身を別レシピや外食に変える」ことはできた。今回はさらに、曜日と朝昼夜の枠そのものを設定画面から動かせるようにした。箪笥の中身を替えるだけでなく、引き出しを別の段へ移せるようにした一手だ。

---

## 何をやったか

### Step 1: PATCH API を枠移動に対応

変更:

- `src/app/api/weekly-locks/[id]/route.ts`

追加内容:

- `dayOfWeek` と `mealType` を `PATCH` で受け取る
- 曜日は 0-6、食事枠は `breakfast` / `lunch` / `dinner` のみ許可
- 既存の固定を読み、未指定の値は現在値を使って更新
- 移動先が既存固定と重複した場合は 409 で明示

`locked_meals` には `user_id, day_of_week, meal_type` の unique 制約がある。DB の制約を最後の砦にしつつ、API 側でも人に読めるエラーへ変換した。

### Step 2: 設定画面から曜日・食事枠を編集可能に

変更:

- `src/app/(main)/settings/WeeklyLocksClient.tsx`

追加内容:

- 各固定行に「曜日」「食事」「内容」の 3 セレクトを表示
- 内容は引き続き外食固定またはレシピを選択可能
- 変更がある時だけ更新ボタンを有効化
- ほかの固定と同じ曜日・食事枠へ動かす場合は更新を止め、画面上で衝突を表示

### Step 3: 起動手順の案内を整備

変更:

- `README.md`
- `src/app/setup/page.tsx`

追加内容:

- README を Next.js 初期文面からプロジェクト固有の起動手順へ更新
- `.env.example` から `.env.local` を作る PowerShell コマンドを記載
- `/setup` 画面にも `.env.example` をコピーする手順を表示

---

## 検査

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

補足:

- `npm run typecheck` は `package.json` に未定義だったため、直接 `tsc --noEmit` を実行した
- `git diff --check` は CRLF/LF の予告警告のみで、空白エラーは無し
- `next build` で `/api/weekly-locks/[id]` は Dynamic Route として正常にビルドされた

---

## 起動確認

起動:

```powershell
scripts\start-dev.cmd
```

確認:

- `http://localhost:3000/settings` を開く
- Supabase env が無い現在の環境では `http://localhost:3000/setup` へリダイレクト
- `Supabase 接続設定が必要です`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

以上が表示されることを確認した。

---

## 変更ファイル

- `src/app/api/weekly-locks/[id]/route.ts`
- `src/app/(main)/settings/WeeklyLocksClient.tsx`
- `src/app/setup/page.tsx`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_23.md`

---

## 次にやること

### 1. 実 Supabase 環境で毎週固定を確認

`.env.local` を入れた環境で以下を確認する。

- 毎週固定の曜日移動
- 朝昼夜の枠移動
- 移動先重複時のエラー表示
- 更新後の献立生成への反映

### 2. 画像 URL 投入

`007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。

### 3. 設定画面の視覚改善

実データが入った状態で、固定行が多い場合の見通しを確認する。必要なら曜日別グループや折りたたみを検討する。
