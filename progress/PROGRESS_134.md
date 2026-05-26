# PROGRESS_134

> レシピ検索の適用条件表示 追加 - 2026-05-26

## ねらい

PROGRESS_133 で `/recipes` に `条件をリセット` を追加した。
でも、複数の条件を触った後は「何が適用されているのか」も見えた方が戻りやすい。

検索 UI は小さな地図みたいなものだと思う。
戻る道だけでなく、いま立っている場所も見えると迷いにくい。

## 変更内容

### Step 1: active filter label を追加

`src/app/(main)/recipes/RecipesClient.tsx` に `activeFilterLabels` を追加した。

表示対象は次の条件。

- 検索語
- 食事
- ジャンル
- 調理時間
- kcal
- PFC
- 在庫一致
- 並び順

### Step 2: 結果数の上に `適用中` チップを表示

条件がひとつでも有効な時だけ、`適用中` の横に小さなチップを並べる。
チップには条件名を入れ、長い検索語は崩れないように truncate する。

これで `条件をリセット` が何を戻すのか、画面上でわかるようになった。

## 検証

```powershell
npm.cmd run docs:progress-index
npm.cmd run docs:links
npm.cmd run docs:mojibake
npm.cmd run typecheck
npm.cmd run check
npm.cmd run release:check
git diff --check
```

すべて pass。

## 変更ファイル

- `src/app/(main)/recipes/RecipesClient.tsx`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_134.md`
