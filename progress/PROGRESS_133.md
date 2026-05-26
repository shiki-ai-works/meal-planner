# PROGRESS_133

> レシピ検索リセット導線 追加 - 2026-05-26

## ねらい

`/recipes` は検索語、食事、ジャンル、調理時間、kcal、PFC、在庫一致、並び順を組み合わせられる。
でも条件をいくつか触った後、元に戻すボタンは空状態まで行かないと見えなかった。

これは実際に触ると、小さな砂利みたいに効いてくる。
条件が複雑になるほど「いま何で絞られているんだっけ」となりやすいからだね。

## 変更内容

### Step 1: active filter 判定を追加

`src/app/(main)/recipes/RecipesClient.tsx` に `hasActiveFilters` を追加した。

対象は次の条件。

- 検索語
- 食事タイプ
- ジャンル
- 調理時間
- kcal
- PFC 条件
- 在庫一致のみ
- 並び順

### Step 2: 結果数の横にリセットボタンを追加

条件がひとつでも有効な時だけ、結果数や在庫一致件数の横に `条件をリセット` を表示する。
空状態にならなくても、いつでも初期表示へ戻せる。

## 検証

```powershell
npm.cmd run docs:progress-index
npm.cmd run docs:links
npm.cmd run docs:mojibake
npm.cmd run check
npm.cmd run release:check
git diff --check
```

すべて pass。

## 変更ファイル

- `src/app/(main)/recipes/RecipesClient.tsx`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_133.md`
