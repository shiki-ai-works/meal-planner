# 超献立プランナー 開発進捗 #34

> **README と setup の Supabase 導線同期** — 2026-05-25

前回 `/setup` に Supabase の鍵取得案内を足したため、今回は README 側も同じ地図へそろえた。画面と文書が別々の方角を指すと、利用者は二つの羅針盤を持って迷う。故に、起動前に読む README と、起動後に見る `/setup` の説明を近づけた。

参考:

- Supabase API keys 公式説明: https://supabase.com/docs/guides/getting-started/api-keys

---

## 何をやったか

### Step 1: README に setup と demo の導線を明記

変更:

- `README.md`

追加内容:

- Supabase の値がない場合でも `/demo` を見られること
- `/setup` で不足キーと鍵の取り方を確認できること

### Step 2: README に鍵の探し場所を追加

変更:

- `README.md`

追加内容:

- Supabase Dashboard で対象プロジェクトを開く
- Connect ダイアログ、または `Settings > API Keys` を見る
- `NEXT_PUBLIC_SUPABASE_URL` は Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` は publishable key、または legacy anon key
- Supabase Dashboard と API keys 公式説明へのリンク

### Step 3: README に鍵の安全注意を追加

変更:

- `README.md`

追加内容:

- `NEXT_PUBLIC_` で始まる値はブラウザへ公開される
- secret key / service_role key は `NEXT_PUBLIC_SUPABASE_ANON_KEY` に入れない

---

## 検証

通過:

```powershell
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
```

ブラウザ確認:

- `http://localhost:3000/setup`
- Supabase 鍵取得案内が表示される
- Supabase Dashboard / API keys 公式説明への導線が表示される
- secret key / service_role key の注意が表示される
- 横はみ出しなし
- `デモを見る` から `/demo` へ遷移できる

---

## 変更ファイル

- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_34.md`

---

## 次にやること

### 1. 画像 URL 投入設計

Supabase 未設定でも進められるため、次は `recipes.image_urls` へ入れる URL manifest と SQL 生成導線を詰める。

### 2. 実 Supabase 環境での確認

`.env.local` が入ったら、ログイン後の `/recipes` / レシピ詳細 / 設定画面を実データで確認する。

### 3. 設定画面の固定一覧の見通し改善

固定が増えた時に、設定画面の一覧が長くなりすぎないかを確認する。
