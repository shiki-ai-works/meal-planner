# 超献立プランナー 開発進捗 #21

> **毎週固定の編集 API / UI** — 2026-05-24

今回は、僕の判断で「毎週固定をクライアントから直接 DB 操作する形」から一歩進めた。解除・更新は `/api/weekly-locks/[id]` に集め、設定画面からは API を呼ぶ。窓口を一つ置けば、認証・検証・エラー文言の責任が散らばらない。

---

## 何をやったか

### Step 1: 認証つき Route Handler を追加

追加:

- `src/app/api/weekly-locks/[id]/route.ts`

追加内容:

- `PATCH`
  - レシピ差し替え
  - 外食固定への変更
  - `recipeId` がある場合はレシピ存在確認
  - `id` と `user_id` の両方で対象を絞る
- `DELETE`
  - 毎週固定を解除
  - `id` と `user_id` の両方で対象を絞る

Route Handler は Next.js の API 用ファイルだ。今回は Next.js 16 の仕様に合わせ、動的ルートの `params` を Promise として扱っている。

### Step 2: 設定画面の解除を API 経由へ変更

変更:

- `src/app/(main)/settings/WeeklyLocksClient.tsx`

変更内容:

- Supabase クライアントから直接 `delete()` していた処理を `/api/weekly-locks/[id]` の `DELETE` 呼び出しへ変更
- 失敗時は画面上の楽観更新を戻す

### Step 3: レシピ差し替え / 外食固定 UI を追加

変更:

- `src/app/(main)/settings/WeeklyLocksClient.tsx`

追加内容:

- 各固定枠にセレクトを追加
- `外食固定` または既存レシピを選べる
- 変更がある時だけ `更新` ボタンを有効化
- 更新成功後はローカル表示とサーバー表示を再同期

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

- `git diff --check` は CRLF/LF の予告警告のみで、空白エラーは無し
- `next build` で `/api/weekly-locks/[id]` が Dynamic Route として認識された
- Codex Browser で `http://127.0.0.1:3000/settings` を開こうとしたが、今回も `ERR_CONNECTION_REFUSED` で視覚確認は未実施
- `.env.local` が無いため、本物の Supabase データでの更新・解除確認は未実施

---

## 変更ファイル

- `src/app/api/weekly-locks/[id]/route.ts`
- `src/app/(main)/settings/WeeklyLocksClient.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_21.md`

---

## 次にやること

### 1. 実データ確認

`.env.local` を用意した環境で以下を確認する。

- 毎週固定の解除
- レシピ差し替え
- 外食固定への変更
- 更新後の献立生成への反映

### 2. 曜日・食事枠の変更 UI

今は既存枠の中身だけ変更できる。曜日や朝昼夜そのものを移動する UI は未着手。

### 3. 画像 URL 投入

引き続き `007_recipe_images.sql` などで 35 件分の `recipes.image_urls` を投入する設計へ進む。
