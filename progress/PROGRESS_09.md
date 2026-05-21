# 超献立プランナー 開発進捗 #09

> **PROGRESS_08 残タスクの動作確認 + 常備品テンプレート UI 実装** — 2026-05-21

PROGRESS_08 で残った 005/006 適用後の動作確認を済ませ、ROADMAP "Next" の最優先機能「常備品テンプレート UI」を実装した。dev server は 3001 で稼働、TypeScript チェックはクリーン。

---

## 何をやったか

### Step 1: 状況把握とロードマップ確認

GitHub URL (`https://github.com/shiki-ai-works/meal-planner`) のローカル拠点 `D:\projects\meal-planner\` で、以下を読み込んで次にやることを決定:

- `PROGRESS_08.md` — マイグレーション 005/006 未適用、動作確認が次タスクと明記
- `ROADMAP.md` — Now: 005/006 適用 + 動作確認 / Next: 常備品テンプレ / 外食オーバーライド / レシピ画像
- `CLAUDE.md` (→ AGENTS.md) — Next.js 16 の破壊的変更注意
- メモリ `project_meal_planner.md` — プロジェクト全体像

### Step 2: マイグレーション 005/006 動作確認

ユーザーから「005/006 は既に終わっている」と確認を得たため、コードレビュー方式で動作確認:

- [`SettingsClient.tsx`](src/app/(main)/settings/SettingsClient.tsx) — 目標カロリー (CALORIE_RANGE) / PFC (PFC_RANGE) バリデーション健全、合計≠100% で保存ボタン disabled
- [`RecipeDetailClient.tsx`](src/app/(main)/recipes/[id]/RecipeDetailClient.tsx) — `recipe.steps` を order でソートして表示、JSONB の `{order, description}` 形式と整合
- [`NutritionChart.tsx`](src/components/nutrition-chart/NutritionChart.tsx) — `targetCalories` / `targetPfc` props を受け取り、目標値マーカー (▲) と棒グラフ色分け (達成=success / 未達=accent/60) を実装
- [`dashboard/page.tsx`](src/app/(main)/dashboard/page.tsx) → [`WeekCalendar.tsx`](src/app/(main)/dashboard/WeekCalendar.tsx) → `NutritionChart` の props チェーンも `dbUser?.target_calories ?? 2000` などフォールバック込みで繋がっている

実装側に修正は不要と判断。dev server を起動してユーザー側でブラウザ確認に進んだ。

### Step 3: dev server 起動 (port 競合)

`cd /d/projects/meal-planner && npm run dev` をバックグラウンド起動したところ、Port 3000 が PID 26448 (別の node プロセス、2026-05-21 02:17 起動) に占有されており、**Next.js は自動で 3001 にフォールバック**。

```
⚠ Port 3000 is in use by process 26448, using available port 3001 instead.
▲ Next.js 16.2.6 (Turbopack)
- Local: http://localhost:3001
```

26448 は別セッションで起動した dev server と推定。動作確認には影響ないため 3001 で続行。止めるなら `Stop-Process -Id 26448`。

### Step 4: メモリ更新

`project_meal_planner.md` のマイグレーション 005/006 を「⏳ 未適用」→「✅ 適用済み (2026-05-21)」に更新。

### Step 5: 常備品テンプレート UI 実装

ROADMAP の Next 最優先「常備品テンプレート (`pantry_templates`) UI」を実装。`pantry_templates` テーブルは Phase 1 で作成済みだが UI 未着手だった。

#### 設計判断

| 論点 | 採用 | 理由 |
|---|---|---|
| 配置 | **単独ページ `/pantry`** | 設定ページ内タブは UI 過密。将来拡張余地も確保 |
| ナビゲーション | **設定 + 買い物リストからリンク** (ボトムナビには入れない) | 日常的に開くページではない。アイコン枠を圧迫しない |
| マッチング | **name のみ、NFKC + lowercase 正規化** | unit/category は気にしない。「米 (kg)」「米 (合)」も常備扱い |
| プリセット | **16 種を組み込み** (米/ご飯/塩/胡椒/醤油/砂糖/みりん/酒/酢/サラダ油/ごま油/バター/にんにく/しょうが/だし/味噌) | 「+」タップでワンクリック追加。登録済みは disabled |
| 保存方式 | **upsert (onConflict: user_id)** | テーブル定義に `user_id unique` 制約あり |

#### 変更ファイル一覧

| ファイル | 種別 | 変更内容 |
|---|---|---|
| [`src/lib/shopping-list.ts`](src/lib/shopping-list.ts) | edit | `BuildOpts.pantryItems?` 追加、`normalizeName()` ヘルパ、出力時に pantrySet マッチで除外 |
| [`src/app/(main)/pantry/page.tsx`](src/app/(main)/pantry/page.tsx) | **new** | SSR で `pantry_templates` を maybeSingle 取得、`/settings` 戻りリンク + ヘッダー |
| [`src/app/(main)/pantry/PantryClient.tsx`](src/app/(main)/pantry/PantryClient.tsx) | **new** | 登録一覧 (カテゴリ別) + 手動追加フォーム + プリセット + 保存ボタン |
| [`src/app/(main)/shopping/page.tsx`](src/app/(main)/shopping/page.tsx) | edit | `pantry_templates` をフェッチして `buildShoppingList` に渡す。ヘッダーに「🥢 常備品 (N)」Link を追加 |
| [`src/app/(main)/settings/page.tsx`](src/app/(main)/settings/page.tsx) | edit | `pantry_templates.items` の件数を SSR 取得、Link カード追加 |

#### コードハイライト

**shopping-list.ts** — pantry 除外ロジック:

```ts
function normalizeName(s: string): string {
  return s.trim().toLowerCase().normalize('NFKC')
}

// buildShoppingList の出力ループ内
for (const item of merged.values()) {
  if (pantrySet.has(normalizeName(item.ingredient_name))) continue
  if (item.amount <= 0 && item.consumed <= 0) continue
  // ...
}
```

**PantryClient.tsx** — upsert:

```ts
const { error: upErr } = await supabase
  .from('pantry_templates')
  .upsert({ user_id: user.id, items }, { onConflict: 'user_id' })
```

### Step 6: TypeScript チェック

`npx tsc --noEmit` → **exit 0**。型エラーなし。`PantryTemplateItem` / `DbPantryTemplate` 型は `types/database.ts` に既に定義されていたため、新規追加不要だった。

---

## 詰まったポイント

### dev server の Port 3000 占有

PID 26448 (node) が 2026-05-21 02:17 から 3000 を保持。別セッションで起動したものと推定。Next.js が自動で 3001 にフォールバックしたため動作確認には支障なし。今後は dev server を起動する前に `netstat -ano | grep :3000` で確認すると良い。

### 作業環境 (worktree からの編集)

当セッションは push-to-talk 用 worktree (`D:\ClaudeCode_project\.claude\worktrees\infallible-kepler-740d50`) で起動していた。PROGRESS_08 で「次セッションは必ず `D:\projects\meal-planner` を working directory にして起動」と記載されていたが、ユーザー判断で worktree のまま継続。Read/Edit はフルパス指定で動き、`cd /d/projects/meal-planner && <cmd>` で git/npm も問題なく操作できた。**git push を別環境から重ねないこと**さえ守れば、worktree 経由でも `D:\projects\meal-planner` の編集は安全。

---

## 現在の状態

```
拠点:           D:\projects\meal-planner\
当セッション cwd: D:\ClaudeCode_project\.claude\worktrees\infallible-kepler-740d50 (worktree 経由)
最新ローカル HEAD: 950aa71 Add ROADMAP.md and PROGRESS_08 (force-push recovery + 拠点移行)
未コミット変更: 5 ファイル (この PROGRESS_09 を除く)
TypeScript:     クリーン (exit 0)
dev server:     http://localhost:3001 で稼働中 (port 3000 は別プロセス占有)
```

### マイグレーション適用状況

- ✅ 001 / 002 / 003 / 004 / 005 / 006 — 全て適用済み

### Phase 2 機能ステータス

- ✅ ペルソナ定義
- ✅ 献立生成エンジン + API
- ✅ ミールカード / ダッシュボード
- ✅ レシピ詳細ページ (35 件全件詳細手順)
- ✅ 栄養グラフ (目標値連動)
- ✅ 在庫管理
- ✅ 設定ページ (目標カロリー/PFC 含む)
- ✅ 買い物リスト (自動消費カウント + カゴ永続化)
- ✅ **常備品テンプレート (今セッション)**
- ⏳ 消費判定の手動オーバーライド (外食スキップ UI)
- ⏳ レシピ画像対応

---

## 次にやること

ROADMAP Next の残り 2 項目を順次:

### 1. 消費判定の手動オーバーライド (外食スキップ UI)

**現状の課題:** `src/lib/shopping-list.ts` の `SLOT_CONSUMED_HOUR = [9, 14, 21]` で朝9/昼14/夜21 にハードコード自動カウント。「今日は外食したから dinner はスキップ」の手動コントロールができない。

**設計案:**
- `meal_plans.plan` の `DayMeals` に `is_eating_out_*` フラグは既に存在 → ダッシュボードの MealCard から切替できるようにする
- 外食フラグ ON のスロットは買い物リストの自動消費から除外 (既に `buildShoppingList` で `EATING_OUT_KEYS` を見ているので、UI 切替を足すだけ)
- ダッシュボード MealCard に「🍽️ 外食」ボタン (既存の 4 状態のうち外食状態への遷移を手動でできるように)

### 2. レシピ画像対応

`recipes.image_urls` カラム未活用。レシピ詳細にヒーロー画像、MealCard にサムネ表示。画像ソース (AI 生成 / Web URL) は要設計。

---

## 教訓・気付き

1. **既存型定義の確認は最初に**。`PantryTemplateItem` / `DbPantryTemplate` が既に定義済みで、新規追加不要だった
2. **正規化はミニマルに**。NFKC + lowercase だけで日本語食材名の表記揺れはかなり吸収できる
3. **マッチングのスコープ**。常備品判定は name のみで十分。unit や category は表示用と割り切れる
4. **worktree 経由の編集は可能だが、明示的に意識する**。フルパス Read/Edit は機能するし、`cd /d/projects/meal-planner && <cmd>` で git/npm も動く
5. **コードレビュー方式の動作確認**。dev server 起動前に主要コンポーネントの props チェーンと型を追えば、実装側の問題は事前検出できる

---

## 注意点・引き継ぎ事項

- **未コミット変更あり**。`git status` で 5 ファイル変更 (shopping-list.ts / shopping/page.tsx / settings/page.tsx / pantry/page.tsx / pantry/PantryClient.tsx) + この PROGRESS_09。次回着手前に commit 推奨
- **dev server 3001 が走りっぱなし**の可能性。再起動するなら `Stop-Process -Id <pid>` で止める
- **port 3000 占有プロセス (PID 26448)** は別の node。今後動作確認するときは netstat で先に確認
- **`/pantry` ページは未テスト** (TS チェックは通っているが、Supabase に upsert 投げる実動作はユーザー側ブラウザで確認待ち)
- 設定ページの「🥢 常備品テンプレート」カード件数は SSR で取得。常備品を追加・削除した直後は設定ページに戻ると `router.refresh()` 経由で正しい件数になる
