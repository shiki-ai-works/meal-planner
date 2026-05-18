# 超献立プランナー 開発進捗 #03

> **Phase 2 主要実装 + 手動テスト初回** — 2026-05-18

## このセッションでやったこと

### 重要な発見
- PROGRESS_01_2 では「ペルソナ定義」「献立生成エンジン」が完了とされていたが、
  実際には `src/lib/personas/` `src/lib/meal-generator/` `src/lib/nutrition-calculator/` は**空ディレクトリ**だった
- git 履歴にも残っておらず、実装は失われていた → 再実装した

### 実装したもの

#### 1. ペルソナ定義 — [src/lib/personas/index.ts](../src/lib/personas/index.ts)
- 6人のペルソナ (`mei` / `arisa` / `tsuzuri` / `iris` / `cleio` / `milra`)
- 各ペルソナに `genres` / `methods` / `tags` / `preferredTimeMax` / `preferredDifficultyMax` / `nutritionBias` を定義
- `PERSONAS` マップ / `getPersona()` / `PERSONA_LIST` を export

#### 2. 献立生成エンジン — [src/lib/meal-generator/](../src/lib/meal-generator/)
- `types.ts` — `GenerateInput` / `GenerateOutput` / `ScoredRecipe` / `MealSlot`
- `filter.ts` — 食事タイプ・アレルギー・嫌い食材で除外
- `scorer.ts` — 6軸スコアリング（ジャンル2.0 / 調理法1.5 / タグ1.2 / 時間1.0 / 栄養1.0 / 難易度0.8）
- `generator.ts` — 重み付きランダム + 直近5食重複回避 + 固定枠（locked_meals）反映 + シード対応 (mulberry32)
- `index.ts` — 集約 export

#### 3. API ルート — [src/app/api/generate-plan/route.ts](../src/app/api/generate-plan/route.ts)
- POST: `{ personaId?, weekStartDate (YYYY-MM-DD), seed? }`
- Supabase auth で認証 → 未認証は 401
- `users` / `recipes` / `locked_meals` を並列取得
- `personaId` 未指定なら `users.selected_persona` を使用
- `generateWeekPlan()` を呼び出し
- `meal_plans` に **upsert** (`onConflict: 'user_id,week_start_date'`)
  - 初版は deactivate→insert にしたが UNIQUE 制約 `meal_plans_user_week_unique` で衝突 → upsert に修正
- レスポンス: `{ mealPlan, personaId }` (201)

#### 4. ミールカード — [src/components/meal-card/MealCard.tsx](../src/components/meal-card/MealCard.tsx)
- Props: `slot`, `recipe`, `isLocked`, `isEatingOut`, `onClick`, `onToggleLock`
- 4状態: `normal` (Linkでレシピ詳細へ) / `locked` / `eating-out` / `empty`
- スロット別カラー左ボーダー: 朝=warning(黄) / 昼=success(緑) / 夜=accent(青)
- HUD 風枠 + 「固定/解除」ボタン

#### 5. ダッシュボード — [src/app/(main)/dashboard/](../src/app/(main)/dashboard/)
- `page.tsx` (Server Component): 今週月曜の日付計算 `(getDay()+6)%7` + user/recipes/active plan を並列取得
- `WeekCalendar.tsx` (Client Component): ペルソナドロップダウン + 「献立を生成」ボタン + 7日×3食グリッド
- 「献立を生成」→ `/api/generate-plan` POST → state 更新 + `router.refresh()`

### 環境セットアップ
- Windows 側 `D:\ClaudeCode_project\meal-planner\.env.local` がプレースホルダになっていたので、
  WSL2 側 `\\wsl$\Ubuntu\home\sakur\meal-planner\.env.local` から本物の URL / anon key をコピー
  - `NEXT_PUBLIC_SUPABASE_URL=https://xnmfukjlepygbmccmuun.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a5Z_2PIH3CSEgQiVmxgiOg_Ljzun8ve`
  - `SUPABASE_SERVICE_ROLE_KEY` は WSL2 側もプレースホルダだったのでそのまま (現状API未使用)

### 手動テスト
- dev server を Windows 側で起動 → `http://localhost:3000`
- `/signup` で「Failed to fetch」→ .env プレースホルダが原因と判明、修正後リロードで成功
- ダッシュボードで「献立を生成」→ UNIQUE 制約エラー → upsert に修正
- レシピ詳細ページ `/recipes/[id]` は実は実装済みだった（材料・作り方・栄養成分・人数調整）
  - PROGRESS_01_2 の「⬜ レシピ詳細ページ」は古い情報

## リポジトリ状態


```
ローカル: D:\ClaudeCode_project\meal-planner
リモート: origin → https://github.com/shiki-ai-works/meal-planner (private)
ブランチ: main
本セッションの変更はまだ commit していない
```


変更ファイル一覧:
- `src/lib/personas/index.ts` (新規)
- `src/lib/meal-generator/{types,filter,scorer,generator,index}.ts` (新規)
- `src/app/api/generate-plan/route.ts` (新規)
- `src/components/meal-card/{MealCard.tsx,index.ts}` (新規)
- `src/app/(main)/dashboard/{page.tsx,WeekCalendar.tsx}` (page は書き換え、WeekCalendar は新規)
- `.env.local` (本物のキーに差し替え・gitignore済み)

## 次にやること（推奨順）

1. **手動テストの続き** — upsert 修正後の動作確認、ペルソナ切替で傾向が変わるか
2. **commit & push** — Phase 2 主要機能のスナップショット
3. **ペルソナ選択 UI** を独立コンポーネント化 (`src/components/persona-selector/`) → カード型 UI に
4. **栄養グラフ** (`src/components/nutrition-chart/`) — 週合計の栄養成分を可視化
5. **買い物リスト機能** — `/api/shopping-list/` (API) + `/(main)/shopping/page.tsx` (UI)
6. **在庫管理** `/(main)/inventory/page.tsx`
7. **設定ページ** `/(main)/settings/page.tsx` (嫌い食材・アレルギー・既定ペルソナ)
8. **固定/解除 UI の配線** — MealCard に渡しているがダッシュボード側で未配線

## 既知の課題・注意点

- `meal_plans` には DB 側で `UNIQUE(user_id, week_start_date)` 制約がある（schemaの定義漏れ？要確認、`001_initial_schema.sql` には未記載）
- 直近5食重複回避は **slot をまたいで** 効くので、朝昼夜が違うレシピなら別物として扱う実装になっている（意図通りか要確認）
- WSL2 側と Windows 側で 2 つの `node_modules` / `.env.local` が並存している。
  どちらを正にするか方針決め推奨
- Next.js 16.2.6 (Turbopack) は `.env.local` の変更で自動再起動しない → 手動再起動が必要
