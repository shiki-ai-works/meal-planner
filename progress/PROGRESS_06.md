# 超献立プランナー 開発進捗 #06

> **栄養グラフ / 在庫管理 / 設定 / 買い物リスト（自動カウント + カゴ永続化）** — 2026-05-19

## このセッションでやったこと

PROGRESS_05 の続き。MEMORY の「未着手」リストを上から順に潰した。栄養グラフ・在庫管理・設定ページの3機能を最小実装→push、その後 LLM のおすすめに乗って買い物リストもプレースホルダから本実装へ。途中でユーザー指示により挙動を2回入れ替え、最終的に「献立から自動カウント＋カゴはチェックボックスで永続化」という形に着地。

### Step 1: 栄養グラフ
- 新規 `src/components/nutrition-chart/NutritionChart.tsx` + `index.ts`
  - 依存ライブラリなし。div ベースのスタック棒と日別棒グラフ
  - 週合計 PFC バランス（kcal比 100% スタック）
  - 日別カロリー棒グラフ（目標 2000kcal、達成日は success 色）
  - 1日平均 kcal 表示
- `WeekCalendar.tsx` で plan 存在時のみ描画

### Step 2: 在庫管理
- `DbInventory` 型を `src/types/database.ts` に追加
- `src/app/(main)/inventory/page.tsx` — サーバーで取得（賞味期限昇順）
- 新規 `InventoryClient.tsx`
  - 追加フォーム（食材名 / 数量 / 単位 / 賞味期限）
  - ブラウザ Supabase で直接 INSERT/DELETE（RLS `inventory_self` 経由）
  - 賞味期限による色分け：経過=danger / 0–3日=warning / それ以外=muted

### Step 3: 設定ページ
- `src/app/(main)/settings/page.tsx` — `users` 行を取得
- 新規 `SettingsClient.tsx`
  - 表示名 / 既定の人数 / 優先ペルソナ / 苦手食材 / アレルギー食材を編集
  - リスト入力はカンマ・読点・改行のいずれかで区切り
  - 保存後 `router.refresh()` で再フェッチ
- これによりダッシュボードのペルソナ初期値（`selected_persona`）が正しく動作

### Step 4: 1回目の commit + push
- commit: `07396f6..4f20448 main -> main`
- 6ファイル新規 / 2ファイル修正 / 665 追加 / 10 削除
- 含: PROGRESS_05.md（前セッションの未 push 分）

### Step 5: 買い物リスト（初版）
- 新規 `src/lib/shopping-list.ts` — 集計ロジック
  - 各曜日×スロットの recipe.ingredients を `name+unit` でマージ
  - `default_servings` でスケール
  - 外食スロットは除外
  - 在庫の amount を差し引き
  - カテゴリ別グルーピング（CATEGORY_EMOJI で 🥬🐟🥩🧀🌾🧂📦）
- `src/app/(main)/shopping/page.tsx` — サーバーで集計
- 新規 `ShoppingClient.tsx` — チェックボックスで取り消し線（セッション内ステート）

### Step 6: 「使い切るまで取り消し線」挙動（捨て）
- ユーザー指示「書かれているだけの量を使い切ったら、取り消し線が外れる」
- ShoppingClient に `+/− / 満 / ↺` ボタンを追加して手動で「使った量」を入力する形に変更
- 試運転 → **次の指示で却下**

### Step 7: 自動カウントに転換
- ユーザー指示「メニュー選択で、選ばれて、調理され、消費された量を、自動でカウント」
- `shopping-list.ts` を `ShoppingItem` 型（`amount` と `consumed` 両方）に書き換え
- スロット消費完了の判定：朝 9:00 / 昼 14:00 / 夜 21:00 を過ぎたら「調理済み」とみなす
- 過去スロットの ingredient×scale を `consumed` に加算
- 在庫差し引きは `amount` 側のみ（消費トラッキングには影響しない）
- ShoppingClient から手動ボタンを撤去、`consumed/amount` 表示＋プログレスバー
- 取り消し線は `consumed >= amount` で外れる

### Step 8: カゴチェックボックス追加 + 永続化
- 各品目の左にチェックボックス（買い物カゴ）を追加
- ヘッダに「カゴ X/Y」「消費 X/Y」を並列表示
- ユーザー指示「品目の取り消し線が外れるまでは永続化」
- 実装：
  - `localStorage` キー `meal-planner:basket:<weekStartDate>` に Set を JSON 保存
  - `useEffect` で初期マウント時にハイドレーション
  - `consumed >= amount` を満たした瞬間に永続化セットからキーを自動削除（取り消し線が外れたタイミングと一致）

## ファイル変更まとめ

```
新規:
  src/components/nutrition-chart/NutritionChart.tsx
  src/components/nutrition-chart/index.ts
  src/app/(main)/inventory/InventoryClient.tsx
  src/app/(main)/settings/SettingsClient.tsx
  src/app/(main)/shopping/ShoppingClient.tsx
  src/lib/shopping-list.ts
  progress/PROGRESS_05.md  ← 1回目 push に含めた
  progress/PROGRESS_06.md  ← このファイル

修正:
  src/types/database.ts                       (+DbInventory 型)
  src/app/(main)/dashboard/WeekCalendar.tsx   (NutritionChart 組み込み)
  src/app/(main)/inventory/page.tsx           (placeholder → 本実装)
  src/app/(main)/settings/page.tsx            (placeholder → 本実装)
  src/app/(main)/shopping/page.tsx            (placeholder → 本実装)
```

## 現在の状態

```
主作業ディレクトリ: WSL2 ~/meal-planner
GitHub:             https://github.com/shiki-ai-works/meal-planner (private)
最新push:           4f20448 (Step 4 まで反映)
未push:             Step 5〜8（買い物リスト関連）+ PROGRESS_06.md
dev server:         WSL2 で起動中 (http://localhost:3000)
型チェック:         npx tsc --noEmit → クリーン
```

## 詰まったポイント

### 「取り消し線が外れる」の意図解釈
ユーザーの最初の指示「書かれているだけの量を使い切ったら、取り消し線が外れる」を、最初は「手動カウンタで量を加算 → 達したら線が外れる」と解釈して実装した（Step 6）。AskUserQuestion で確認しようとしたが dismiss された。次の指示で実は「献立から自動カウント」が本来の意図だと判明し、Step 7 で全面書き換え。

教訓：AskUserQuestion が dismiss されたら推測実装ではなく素直にプレーンテキストで聞き直すべき。

### dev server の起動方式
PowerShell から `wsl -d Ubuntu -- bash -c "nohup npm run dev &"` は親シェル終了で WSL ディストロごと落ちるパターンがあり、最初の試行は port 応答なし。`run_in_background: true` 付きの foreground 実行に切り替えて解決。

## 次にやること

1. **未 push 分の commit + push**（Step 5〜8 + PROGRESS_06.md）
2. **常備品テンプレート** (`pantry_templates`) — 登録した常備食材を買い物リストの集計から除外
3. **買い物カゴ状態の DB 永続化（任意）** — 現状は localStorage、別デバイスで共有したくなったら検討
4. **消費判定の手動オーバーライド（任意）** — 「今日は外食したから dinner はスキップ」を後付けで反映する UI

## 注意点・引き継ぎ事項

- 消費完了時刻 `SLOT_CONSUMED_HOUR = [9, 14, 21]` は `src/lib/shopping-list.ts` 内のハードコード。設定で変えたければ users テーブルにカラム追加が必要
- `buildShoppingList` の在庫差し引きは `name__unit` 完全一致。在庫側で「玉ねぎ 2 個」、レシピ側で「玉ねぎ 200g」だとマッチしない（既知の制約）
- localStorage キーは週開始日ベース。週をまたぐと自動的に別セットに切り替わる
- 在庫の RLS は `inventory_self` (`auth.uid() = user_id`)。クライアント直書きでも他人の行は触れない
