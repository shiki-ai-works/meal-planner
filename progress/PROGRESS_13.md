# 超献立プランナー 開発進捗 #13

> **レシピ図鑑 / 検索 UI + 画像 URL 投入 SQL 生成導線** — 2026-05-24

PROGRESS_12 のレシピ画像 UI に続き、レシピを献立カード経由だけでなく一覧から探せるようにした。併せて、画像 URL を Supabase に投入する SQL を JSON から生成する script を追加した。

---

## 何をやったか

### Step 1: `/recipes` 一覧ページ追加

新規:

- `src/app/(main)/recipes/page.tsx`
- `src/app/(main)/recipes/RecipesClient.tsx`

機能:

- 全レシピ一覧を表示
- 料理名・食材・タグ・ジャンル・調理方法を検索対象にする
- 食事タイミングで絞り込み
  - 全て / 朝 / 昼 / 夜 / いつでも
- ジャンルで絞り込み
  - 全て / 和 / 洋 / 中 / エスニック / その他
- 調理時間で絞り込み
  - 指定なし / 10分以内 / 20分以内 / 30分以内
- 調理時間が短い順、同じなら名前順で表示
- 画像あり件数を表示

カードは `recipe.image_urls` があれば写真背景、無ければ `cuisineBackground()` + `fallbackEmoji()` の fallback 表示。

### Step 2: ボトムナビに「レシピ」追加

変更:

- `src/app/(main)/layout.tsx`

5 項目ナビになったため、各 Link を `flex-1` にして狭いスマホ幅でも均等配置されるようにした。

### Step 3: 画像 URL 投入 SQL 生成 script 追加

新規:

- `scripts/generate-recipe-image-sql.mjs`
- `supabase/recipe-images.example.json`

`package.json` に script を追加。

```json
"recipe-images:sql": "node scripts/generate-recipe-image-sql.mjs"
```

使い方:

```powershell
npm.cmd run recipe-images:sql -- supabase/recipe-images.example.json
```

出力例:

```sql
with image_map(name, image_urls) as (
  values
  ('鮭の塩焼き定食', array['https://example.com/recipe-images/salmon-set.webp']),
  ('チキンカレー', array['https://example.com/recipe-images/chicken-curry.webp'])
)
update public.recipes r
set image_urls = image_map.image_urls
from image_map
where r.name = image_map.name;
```

手書き SQL の引用符ミスを避けるための道具。最終的には本物の画像 URL を manifest に入れてから SQL Editor に貼る。

### Step 4: ブラウザ確認

本物の Supabase env は未設定のため、一時的なダミー `.env.local` で `/login` の表示を確認した。確認後、ダミー `.env.local` は削除済み。

確認済み:

- `/login` 表示
- `next build` に `/recipes` が載る

未確認:

- 認証後の `/recipes`
- 実データでの検索・絞り込み
- 実画像 URL ありのカード表示

---

## 検査

すべて通過。

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
npm.cmd run recipe-images:sql -- supabase/recipe-images.example.json
```

---

## 変更ファイル

- `ROADMAP.md`
- `package.json`
- `src/app/(main)/layout.tsx`
- `src/app/(main)/recipes/page.tsx`
- `src/app/(main)/recipes/RecipesClient.tsx`
- `scripts/generate-recipe-image-sql.mjs`
- `supabase/recipe-images.example.json`
- `progress/PROGRESS_13.md`

継続中の未コミット変更:

- PROGRESS_11 / PROGRESS_12 の変更一式

---

## 次にやること

### 1. 本物の Supabase env で `/recipes` を確認

必要:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

確認対象:

- `/recipes` 一覧
- 検索語フィルタ
- 食事 / ジャンル / 時間フィルタ
- レシピ詳細への遷移

### 2. 画像 manifest を作る

提案:

最初は 8-12 件だけでよい。和洋中と朝昼夜が散るように選ぶ。

例:

- 鮭の塩焼き定食
- チキンカレー
- 麻婆豆腐
- オムライス
- 親子丼
- 豚汁
- パスタ系
- 朝食系

### 3. その次の GUI 改善候補

- `/recipes` のカードから「今週の献立に使う」導線
- 在庫食材と一致したレシピを上位表示
- PFC 条件での絞り込み
- レシピ詳細に「買い物リストへ材料を追加」ボタン
