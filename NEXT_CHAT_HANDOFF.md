# NEXT CHAT HANDOFF - 完全栄養ランダム献立達人

作成日: 2026-05-25
作業場所: `D:\Codex\meal-planner`

## 最初に読むもの

1. `AGENTS.md`
2. `NEXT_CHAT_HANDOFF.md`
3. `README.md`
4. `ROADMAP.md`

## 現在地

献立アプリの表示名は、仮決まりとして「完全栄養ランダム献立達人」になっている。

タイトルは将来、画像素材へ置き換える予定。現時点ではテキスト見出しに `app-title-shadow` を当て、文字の奥に床があると仮定した「床に落ちる影」を CSS の疑似要素で表現している。これは仮デザインであり、最終ロゴではない。

## 直近で完了したこと

### 画像導入

- `supabase/recipe-images.actual.json` に 35 件分の画像 URL を整備。
- `supabase/recipe-images.sources.json` に出典メモを追加。
- `supabase/migrations/007_recipe_images.sql` を生成。
- Supabase SQL Editor で migration を適用済み。
- 検証 SQL で 35 件すべて一致、60 recipe row に expected URL が入ったことを確認済み。

### UI改善

- 「週の栄養」を「カロリーバランス」に変更。
- P/F/C 表記を「タンパク質」「脂質」「炭水化物」に変更。
- ゲージ下の矢印を「目標」だと分かる表示にした。
- ダッシュボードの献立カード右上に錠前を追加し、固定 / 解除できるようにした。
- 料理詳細の「献立に入れる」を「現在の一週間のメニュー一覧」へ置き換えた。
- 料理詳細からタップまたはドラッグで今週の献立枠を差し替え可能にした。
- 「つかんで外す」置き場を追加し、献立カードをドラッグして `未定` に戻せるようにした。
- メニュー一覧はその日を含めて約3日分表示し、続きは箱内スクロールにした。
- ドラッグ中に箱の上下端へ近づけると自動スクロールする。
- 料理詳細の栄養グラフを棒グラフから円グラフへ変更。
- 栄養の主要数字、材料の分量と `g` / `ml` を大きくした。
- 材料名の上に出ていた小分類名は非表示にした。

### アプリ名と仮タイトル

- 表示名を「超献立プランナー」から「完全栄養ランダム献立達人」に変更。
- 対象:
  - `src/app/layout.tsx`
  - `src/app/(auth)/layout.tsx`
  - `src/app/(main)/dashboard/page.tsx`
  - `src/app/demo/DemoClient.tsx`
  - `README.md`
- タイトル文字を一段大きくした。
- `src/app/globals.css` に `app-title-shadow` を追加。
- 現在の影は `::after` で複製文字を作り、床面に倒して投影する仮表現。

## 最新検証

最新状態で以下は pass 済み。

```powershell
npm.cmd run check
```

`npm.cmd run check` の中身:

- `setup:doctor:test`
- `recipe-images:workflow:test`
- `recipe-images:workflow`
- `typecheck`
- `lint`
- `build`

ブラウザ確認済み:

- ダッシュボードで新タイトル表示
- タイトルの床落ち影
- カロリーバランス表示
- 錠前の固定 / 解除
- 料理詳細の一週間メニュー一覧
- タップで献立差し替え
- ドラッグで献立から外す
- 円グラフ表示
- 材料欄の分量拡大

## 確認画像

ワークスペースに以下の確認画像がある。

- `app-title-shadow-floor-verify.png`
- `recipe-menu-lock-remove-verify.png`
- `recipe-menu-three-days-verify.png`
- `recipe-nutrition-ingredient-large-verify.png`
- `recipe-nutrition-readable-verify.png`
- `recipe-assign-scroll-verify.png`
- `recipe-detail-ui-verify.png`
- `dashboard-ui-verify.png`

## 重要ファイル

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/app/(main)/dashboard/WeekCalendar.tsx`
- `src/components/meal-card/MealCard.tsx`
- `src/components/nutrition-chart/NutritionChart.tsx`
- `src/app/(main)/recipes/[id]/page.tsx`
- `src/app/(main)/recipes/[id]/RecipeDetailClient.tsx`
- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`
- `src/app/demo/DemoClient.tsx`
- `src/app/api/assign-recipe/route.ts`
- `src/lib/week-plan.ts`
- `supabase/migrations/007_recipe_images.sql`

## Git状態の注意

`D:\Codex\meal-planner` 本体には大量の未コミット変更がある。これは連続作業で積み上がったもの。

重要:

- ユーザーが明示しない限り、meal-planner 本体を commit / push しない。
- 既存の未コミット変更を revert しない。
- `.env.local` の Supabase 情報を会話やノートに書かない。
- Obsidian vault への記録は別リポジトリで行う。

## Obsidian記録

直近の Obsidian vault 追加:

- `D:\Obsidian\ShikiVault\Projects\献立プランナー\2026-05-25_完全栄養ランダム献立達人_UI改善と画像導入.md`
- commit: `736687c Add meal planner UI context note`
- push 済み

この handoff の後続として、今回の「仮タイトル確定」と `NEXT_CHAT_HANDOFF.md` 作成も Obsidian vault に保存する。

## 次にやるなら

1. タイトルを画像素材に置き換える時は、`app-title-shadow` を削るか、画像用の別スタイルへ移行する。
2. 料理詳細の「つかんで入れる」「つかんで外す」の言葉を、必要ならさらに柔らかくする。
3. 調理工程写真を入れる場合は、まず利用可能な実画像を探し、出典・作者・ライセンスを控える。
4. 使える工程写真がない場合は、生成画像で統一感を出す。
5. 本体コミットを作る場合は、画像 workflow、UI改善、タイトル仮デザインを分けて整理する。
