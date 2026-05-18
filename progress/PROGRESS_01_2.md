# 超献立プランナー 開発進捗

> **次セッション引き継ぎ用ドキュメント** — 2026-05-17 時点

## プロジェクト概要

- **アプリ名**: 超献立プランナー（Blue Archive 風 UI の週間献立アプリ）
- **スタック**: Next.js 16.2.6 (Turbopack) + Supabase + Tailwind CSS + TypeScript
- **デザイン**: パステル + HUD アクセント（`src/app/globals.css` の `--accent` 系）

## 開発環境

| 項目 | 設定 |
|------|------|
| OS | Windows 11 + WSL2 (Ubuntu) |
| Node.js | v24.15.0（WSL2 内にインストール済み） |
| プロジェクトパス | `~/meal-planner`（WSL2 内）/ `\\wsl$\Ubuntu\home\sakur\meal-planner`（Windows から） |
| 起動コマンド | `cd ~/meal-planner && npm run dev` → `http://localhost:3000` |
| エディタ | VS Code + WSL Remote 拡張 |

### WSL2 DNS の注意点
- `/etc/resolv.conf` が systemd-resolved に上書きされる問題があり、`/etc/wsl.conf` に以下を設定済み：
  ```
  [network]
  generateResolvConf = false
  ```
- `/etc/resolv.conf` は `nameserver 172.28.64.1`（Windows ホスト IP）を直接記述
- 再起動後に DNS が壊れたら `sudo rm /etc/resolv.conf && echo "nameserver $(ip route | grep default | awk '{print $3}')" | sudo tee /etc/resolv.conf`

## Supabase

- **Project ID**: `xnmfukjlepygbmccmuun`
- **URL**: `https://xnmfukjlepygbmccmuun.supabase.co`
- **リージョン**: Northeast Asia (Tokyo)
- **認証設定**: Confirm email を **OFF**（開発中）
- **環境変数**: `.env.local` に設定済み（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`）

### マイグレーション完了状況
- ✅ `001_initial_schema.sql` — テーブル作成、RLS、auth トリガー
- ✅ `002_seed_recipes.sql` — レシピ25件投入

### DB テーブル一覧
- `users` — ユーザー設定（display_name, default_servings, disliked/allergic_ingredients, selected_persona）
- `recipes` — レシピマスタ（25件投入済み）
- `meal_plans` — 週間献立プラン
- `locked_meals` — 固定枠（特定曜日・特定食事のロック）
- `inventory` — 在庫
- `pantry_templates` — 常備品テンプレート
- `condition_flags` — 体調フラグ
- `shopping_lists` — 買い物リスト履歴

## Phase 1: 完了 ✅

- 認証（signup / login / middleware）
- DB スキーマ + RLS
- レシピシード25件
- ボトムナビゲーション付きメインレイアウト
- ログイン動作確認済み

## Phase 2: 進行中 🚧

### 完了
- ✅ **ペルソナ定義** (`src/lib/personas/`)
  - 6人のペルソナ（mei / arisa / tsuzuri / iris / cleio / milra）
  - 料理ジャンル・調理法・時間・難易度・タグ・栄養の嗜好を定義
  - `PERSONAS` マップ / `getPersona()` / `PERSONA_LIST`

- ✅ **献立生成エンジン** (`src/lib/meal-generator/`)
  - `types.ts` — GenerateInput / GenerateOutput / ScoredRecipe
  - `filter.ts` — アレルギー・嫌い食材・食事タイプでフィルタ
  - `scorer.ts` — 6軸スコアリング（ジャンル×2.0 + 調理法×1.5 + タグ×1.2 + 時間×1.0 + 栄養×1.0 + 難易度×0.8）
  - `generator.ts` — 重み付きランダム選定 + 重複回避 + 固定枠対応 + シード対応
  - `index.ts` — エクスポート集約

### 未着手
- ⬜ **API ルート** (`src/app/api/generate-plan/`) — エンジンをサーバーで呼び出す Route Handler
- ⬜ **ミールカード** (`src/components/meal-card/`) — 1食分の表示コンポーネント
- ⬜ **ダッシュボード** (`src/app/(main)/dashboard/page.tsx`) — 週間カレンダー UI（現在は Phase 1 プレースホルダー）
- ⬜ **ペルソナ選択 UI** (`src/components/persona-selector/`)
- ⬜ **栄養グラフ** (`src/components/nutrition-chart/`)
- ⬜ **レシピ詳細ページ** (`src/app/(main)/recipes/[id]/page.tsx`)
- ⬜ **買い物リスト機能** (`src/app/api/shopping-list/` + `src/app/(main)/shopping/page.tsx`)
- ⬜ **在庫管理** (`src/app/(main)/inventory/page.tsx`)
- ⬜ **設定ページ** (`src/app/(main)/settings/page.tsx`)

## ディレクトリ構造（要点）

```
src/
├── app/
│   ├── (auth)/              # ログイン・新規登録（完成）
│   ├── (main)/
│   │   ├── layout.tsx       # ボトムナビ付き（完成）
│   │   ├── dashboard/       # ← 次に作る
│   │   ├── recipes/[id]/    # 空
│   │   ├── shopping/        # プレースホルダー
│   │   ├── inventory/       # プレースホルダー
│   │   └── settings/        # プレースホルダー
│   └── api/
│       ├── generate-plan/   # ← 次に作る
│       └── shopping-list/   # 空
├── components/
│   ├── meal-card/           # 空 ← 次に作る
│   ├── nutrition-chart/     # 空
│   ├── persona-selector/    # 空
│   ├── shopping-list/       # 空
│   └── ui/                  # 空
├── lib/
│   ├── meal-generator/      # ✅ Phase 2 で実装済み
│   ├── personas/            # ✅ Phase 2 で実装済み
│   ├── nutrition-calculator/# 空
│   └── supabase/            # client/server/middleware（完成）
├── store/                   # 空（状態管理を入れるなら）
├── types/
│   └── database.ts          # DB型定義（完成）
└── proxy.ts                 # middleware
```

## 次にやること（推奨順）

1. **API ルート `/api/generate-plan`** を作る
   - POST: `{ personaId?, weekStartDate }` を受け取る
   - サーバーで Supabase からレシピ・ユーザー設定・固定枠を取得
   - `generateWeekPlan()` を呼び出して結果を `meal_plans` に保存
   - 生成された WeekPlan を返す

2. **ミールカードコンポーネント** を作る
   - 1食分（朝/昼/夜）を表示
   - 状態: 通常 / ロック中 / 外食 / 未定
   - クリックでレシピ詳細へ遷移

3. **ダッシュボード本体** を実装
   - 週間カレンダー（7日 × 3食）でミールカードを並べる
   - 「献立を生成」ボタン → API 呼び出し
   - ペルソナ選択 UI

## 既知の課題・注意点

- `AGENTS.md` に Next.js のバージョン注意あり：
  > このバージョンは破壊的変更が含まれているため、コードを書く前に `node_modules/next/dist/docs/` を確認すること
- `WeekPlan` の曜日インデックスは **0=月曜** スタート（日本式）
- レシピ表示用に Supabase `recipes` テーブルから取得する際、`@/types/database` の `DbRecipe` 型と JSONB カラム（ingredients/steps/nutrition）が合っているか要確認
- Service Role キーは `.env.local` のみ。`NEXT_PUBLIC_` を付けないこと
