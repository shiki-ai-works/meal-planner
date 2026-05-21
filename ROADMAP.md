# 超献立プランナー ROADMAP

> プロジェクト全体の中長期計画。**「次に何をやるか」と「将来どこに向かうか」**を 1 ファイルで把握。
> セッションごとの細かい進捗は `progress/PROGRESS_NN.md`、メモリ運用は Claude 側の `project_meal_planner.md` を参照。

**最終更新:** 2026-05-21 (PROGRESS_08 時点 = `4add5b5`)

---

## ビジョン

Blue Archive 風パステル + HUD アクセントの UI で、**「考えなくていい週間献立アプリ」**を作る。

- 利用シーン: 「今夜何作ろう」「冷蔵庫に何残ってる」「カロリー大丈夫？」「買い物リスト欲しい」を 1 アプリで完結
- ターゲット: 自炊負担を軽くしたい家庭・個人
- 体験のキモ: **ペルソナによる "誰かに任せる" 感**（mei/arisa/tsuzuri/iris/cleio/milra の 6 人）

---

## ステータス凡例

- ✅ 完了
- 🚧 着手中 / 一部完了
- ⏳ 計画あり、未着手
- 💭 アイデア段階、未確定

---

## フェーズ全体図

```
Phase 1 (基盤)         ✅ 完了 (52a04a2..14fbf23)
Phase 2 (主要機能)     🚧 主要機能完了、磨き込み残
Phase 3 (拡張・運用)   ⏳ 計画段階
Phase 4 (将来構想)     💭 アイデア
```

---

## Phase 1: 基盤構築 ✅ 完了

- ✅ 認証（signup / login / middleware）
- ✅ DB スキーマ + RLS
- ✅ レシピシード 25 件 (`002_seed_recipes.sql`)
- ✅ ボトムナビ付きレイアウト
- ✅ Tailwind + Blue Archive 風デザイントークン (`globals.css` の `--accent` 系)

## Phase 2: 主要機能 🚧

### 完了
- ✅ ペルソナ定義（6 人: mei/arisa/tsuzuri/iris/cleio/milra）
- ✅ 献立生成エンジン（filter/scorer/generator）
- ✅ `/api/generate-plan` (POST、ペルソナ優先順位込み)
- ✅ ミールカード 4 状態（通常/ロック/外食/未定）
- ✅ ダッシュボード（7日×3食グリッド、週ナビ、生成ボタン、統計バッジ）
- ✅ レシピ詳細ページ (`/recipes/[id]`)、人数スケール、PFC 表示
- ✅ 栄養グラフ（週合計 PFC + 日別カロリー）
- ✅ 在庫管理 (CRUD、賞味期限色分け)
- ✅ 設定ページ（display_name / default_servings / persona / disliked / allergic / 目標カロリー / PFC バランス）
- ✅ 買い物リスト本実装（自動消費カウント + カゴ永続化）
- ✅ レシピ詳細手順を 35 件全件で詳細化（プロのコツ込み）

### 進行中 🚧
- 🚧 **マイグレーション 005/006 適用 + 動作確認**（PROGRESS_08 時点で未適用）
  - 005_detailed_recipes.sql: レシピ 25→35 件
  - 006_detailed_existing_recipes.sql: 既存 25 件の steps 詳細化
  - 完了後に設定ページ・レシピ詳細・ダッシュボード栄養グラフを動作確認

### 未着手 ⏳
優先度高い順:
1. **常備品テンプレート** (`pantry_templates`)
   - DB テーブルは存在、UI 未実装
   - 常備食材を登録 → 買い物リストから自動除外
   - 効果: 「米・塩・醤油」のような毎週同じものが買い物リストに出ない
2. **消費判定の手動オーバーライド**
   - 「今日は外食したから dinner はスキップ」UI
   - 現状: 朝9/昼14/夜21 でハードコード自動カウント。手動コントロール不能
   - 関連: `src/lib/shopping-list.ts` の時刻判定ロジック
3. **レシピ画像対応**
   - `recipes.image_urls` カラムは存在、活用されていない
   - レシピ詳細にヒーロー画像、MealCard にサムネ表示
   - 画像ソースは AI 生成 or Web から URL 指定？要設計

## Phase 3: 拡張・運用 ⏳

### 機能拡張
- ⏳ **食材ベース検索 / レシピ検索**
  - 「冷蔵庫の鶏もも肉で作れるもの」「20分以内」「PFC バランス重視」
  - filter ロジック拡張
- ⏳ **週単位の好み学習**
  - ロック/スキップ履歴からペルソナのスコアリング微調整
  - 「最近この人ばっかり選んでる」フィードバック
- ⏳ **複数ペルソナのブレンド生成**
  - 「平日は mei、週末は iris」みたいな曜日別アサイン
- ⏳ **買い物リストの分割**
  - スーパー単位 / カテゴリ単位で分割表示

### 運用改善
- ⏳ **画像生成の自動化**
  - 新規レシピ追加時に AI 画像生成して S3/Supabase Storage に保存
- ⏳ **マイグレーション運用ツール化**
  - 現状 Supabase SQL Editor 手動。CLI 導入か API 直叩きスクリプト化
  - 関連: [[feedback-multi-pc-git-workflow]]（手動運用の事故が起きやすい点）
- ⏳ **`recipeMap` の slim 化**
  - PROGRESS_07 で指摘済み。件数増加に備えて id+name のみクライアントに送る形に
- ⏳ **`006` の id 指定切替**
  - 現状 `where name = '...'` で対象指定 → レシピ名変更で破綻リスク

### コード品質
- ⏳ **E2E テスト整備** (Playwright?)
  - 認証フロー、献立生成、買い物リスト、設定保存
- ⏳ **エラー境界の整備**
  - Supabase 接続失敗時のフォールバック UI

## Phase 4: 将来構想 💭

- 💭 **モバイル対応強化**（PWA 化 / ホーム画面追加）
- 💭 **家族間共有**
  - 1 つの献立を複数アカウントで参照・編集
  - 在庫共有
- 💭 **健康データ連携**
  - Fitbit / Apple Health から実摂取カロリー取得 → 目標との差分でレシピ提案
- 💭 **AI レシピ生成**
  - 在庫材料からその場で新レシピ生成
- 💭 **音声入力**（push-to-talk プロジェクトと連携できるか？）
  - 「今日は外食」「明日 iris で生成」を音声で

---

## いま向かっている方向（"Now / Next / Later"）

### Now（このイテレーション）
- マイグレーション 005/006 を本番反映
- 設定/レシピ詳細/栄養グラフの動作確認
- PROGRESS_08 を git commit + push

### Next（次の 1-2 セッション目安）
- 常備品テンプレート UI 実装
- 消費判定の手動オーバーライド UI

### Later（その後）
- レシピ画像対応
- Phase 3 の機能拡張から優先度の高いものを選定

---

## 設計上の制約と原則

- **WeekPlan の曜日インデックスは 0=月曜**（日本式）
- **Next.js 16**: training data と API が異なる可能性大、`node_modules/next/dist/docs/` を要確認（`AGENTS.md` 参照）
- **JSONB カラム** (ingredients/steps/nutrition) と `DbRecipe` 型の整合性を要確認
- **Supabase RLS** で全テーブルガード。サービスロールキーは `.env.local` のみ
- **クライアントに送るデータ量**は意識する（`recipeMap` slim 化等）

---

## 開発再開のクイックスタート

```powershell
# 1. プロジェクトルートで Claude Code を起動
cd D:\projects\meal-planner
claude

# 2. 状態確認
git status
git log --oneline -5

# 3. dev server
npm run dev
# → http://localhost:3000
```

詳細な「次に何をやるか」は最新の `progress/PROGRESS_NN.md` を参照。

---

## 関連ドキュメント

- [`progress/PROGRESS_08.md`](progress/PROGRESS_08.md) — 直近のセッション進捗 + 次にやること（具体的）
- [`progress/PROGRESS_07.md`](progress/PROGRESS_07.md) 以前 — 過去履歴
- [`README.md`](README.md) — プロジェクト概要（Next.js 標準）
- [`AGENTS.md`](AGENTS.md) — Claude Code 向け作業ルール（Next.js 16 注意点）
- [`CLAUDE.md`](CLAUDE.md) — AGENTS.md インポート
- `D:\ClaudeCode_project\sessions\` — セッション横断のナラティブ（複数 PC 移行の経緯など）
- `D:\ClaudeCode_project\lessons\` — インシデント教訓（force-push 事故等）
- Claude メモリ `project_meal_planner.md` — プロジェクト状態の最新サマリ

---

## 更新運用

- このファイルは **セッション毎に追記/調整** する想定
- Now → Next → Later はその時々で並べ替え
- 新規アイデアは Phase 4 (💭) に追加し、優先度が上がったら Phase 3 (⏳) に移動
- 完了したら ✅ にして打ち消し線で残すか、Phase ごとの「完了」セクションに移動
- 大きな方向転換があったら "ビジョン" セクションも見直す
