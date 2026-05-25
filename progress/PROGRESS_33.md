# 超献立プランナー 開発進捗 #33

> **Supabase 未設定時の鍵取得案内改善** — 2026-05-25

`/setup` は「鍵がないから止まった」と知らせるだけでなく、「どこへ行き、何を取り、どこへ貼るか」まで示す必要がある。今回は Supabase 未設定時の玄関を整え、ログイン前に迷子になりにくくした。

参考:

- Supabase 公式 API keys 説明: https://supabase.com/docs/guides/getting-started/api-keys

---

## 何をやったか

### Step 1: Supabase の鍵取得手順を追加

変更:

- `src/app/setup/page.tsx`

追加内容:

- Supabase Dashboard へのリンク
- API keys 公式説明へのリンク
- Project URL と publishable key / legacy anon key を探す説明

### Step 2: 公開してはいけない鍵の注意を追加

変更:

- `src/app/setup/page.tsx`

追加内容:

- `NEXT_PUBLIC_SUPABASE_URL` には Project URL を入れる
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` には公開用 key を入れる
- secret key / service_role key はブラウザに公開される場所へ入れない

### Step 3: 不足キー表示を空状態にも対応

変更:

- `src/app/setup/page.tsx`

追加内容:

- 不足キーがない時の表示

通常は `/setup` へ来る時点で不足キーがあるが、画面単体として破綻しないようにした。

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
- 表示幅: 319px
- 横はみ出しなし
- `Supabase の鍵を手に入れる流れ` が表示される
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が表示される
- secret key / service_role key の注意が表示される
- Supabase Dashboard / API keys 公式説明リンクが 1 件ずつ存在
- `デモを見る` から `/demo` へ遷移できる

---

## 変更ファイル

- `src/app/setup/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_33.md`

---

## 次にやること

### 1. README / setup / demo 導線の再点検

Supabase 未設定でも、起動からデモ確認まで迷わないかを見る。

### 2. 実 Supabase 環境での確認

`.env.local` が入ったら、ログイン後の `/recipes` / レシピ詳細 / 設定画面を実データで確認する。

### 3. レシピ画像 URL 投入

写真の入口はできているため、`recipes.image_urls` へ実 URL を入れて見た目を仕上げる。
