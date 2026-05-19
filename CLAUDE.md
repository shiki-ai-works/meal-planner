@AGENTS.md

# 超献立プランナー — 引き継ぎメモ

## プロジェクト概要

1週間分の献立を栄養バランスを考慮しながら自動生成するNext.js Webアプリ。
仕様書: `C:\Users\sakur\Downloads\超献立プランナーAI_prompt.md`（または別マシンで共有）

---

## 技術スタック

- **Framework**: Next.js 16.2.6 (App Router, Turbopack)
- **言語**: TypeScript (strict)
- **スタイル**: Tailwind CSS v4
- **DB/Auth**: Supabase (PostgreSQL + Auth)
- **状態管理**: Zustand（Phase 2以降で実装予定）
- **グラフ**: Recharts（Phase 2以降）

> ⚠️ **Next.js 16 の破壊的変更に注意**
> - `middleware.ts` → `proxy.ts`（関数名も `middleware` → `proxy`）
> - 詳細は `node_modules/next/dist/docs/` を参照

---

## 開発環境

- **OS**: WSL2 Ubuntu on Windows
- **作業ディレクトリ**: `~/projects/meal-planner`
- **Node.js**: v22.22.3 (nvm管理)
- **パッケージマネージャ**: npm 10.9.8

---

## 現在の進捗

### ✅ Phase 1 完了（2026-05-19）

| 作業 | 状態 |
|---|---|
| Next.jsプロジェクト初期化 | ✅ |
| TypeScript型定義 (`src/types/database.ts`) | ✅ |
| Supabaseクライアント設定 (client/server/middleware) | ✅ |
| 認証ガード (`src/proxy.ts`) | ✅ |
| DBスキーマ (`supabase/migrations/001_initial_schema.sql`) | ✅ |
| サンプルレシピ25件 (`supabase/migrations/002_seed_recipes.sql`) | ✅ |
| ログイン・サインアップ画面 | ✅ |
| メインレイアウト（ボトムナビ）| ✅ |
| グローバルスタイル（Blue Archive風パステル + HUDアクセント） | ✅ |

### ⏳ Phase 2 未着手（次にやること）

- 献立生成アルゴリズム (`src/lib/meal-generator/`)
- ダッシュボードUI（週間カレンダー表示）
- 栄養価計算ロジック
- 4階層ドリルダウン表示
- 部分再生成機能

---

## セットアップ手順（新マシン）

```bash
# 1. クローン
git clone <リポジトリURL>
cd meal-planner
npm install

# 2. 環境変数を作成（.env.exampleをコピーして実際の値を入力）
cp .env.example .env.local
# → NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定

# 3. Supabaseにスキーマ適用（初回のみ）
# Supabase SQL Editor で以下を順番に実行：
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_seed_recipes.sql

# 4. 起動
npm run dev
```

---

## ディレクトリ構造（現時点）

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx       # ログイン画面
│   │   └── signup/page.tsx      # サインアップ画面
│   ├── (main)/
│   │   ├── layout.tsx           # ボトムナビ付きレイアウト（認証チェック込み）
│   │   ├── dashboard/page.tsx   # ← Phase 2で実装
│   │   ├── shopping/page.tsx    # ← Phase 3で実装
│   │   ├── inventory/page.tsx   # ← Phase 3で実装
│   │   └── settings/page.tsx    # ← Phase 3で実装
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # /dashboard へリダイレクト
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # ブラウザ用
│   │   └── server.ts            # Server Component用
│   ├── meal-generator/          # ← Phase 2で実装
│   ├── nutrition-calculator/    # ← Phase 2で実装
│   └── personas/                # ← Phase 4で実装
├── types/
│   └── database.ts              # 全テーブルのTS型定義
└── proxy.ts                     # 認証ガード（Next.js 16 Proxy）

supabase/
└── migrations/
    ├── 001_initial_schema.sql   # テーブル定義 + RLS
    └── 002_seed_recipes.sql     # サンプルレシピ25件
```

---

## DBスキーマ概要

| テーブル | 内容 |
|---|---|
| `users` | ユーザー設定（嫌い食材・アレルギー・ペルソナ選択） |
| `recipes` | レシピマスタ（材料・手順・栄養価・画像URL） |
| `meal_plans` | 週間献立プラン（7日×3食のJSONB） |
| `locked_meals` | 固定枠（外食・ロック） |
| `inventory` | 在庫（消費期限付き） |
| `pantry_templates` | 常備品テンプレート |
| `condition_flags` | 体調フラグ（疲れてる日） |
| `shopping_lists` | 買い物リスト履歴 |

RLS: 全テーブルで `auth.uid() = user_id` 。`recipes`は全ユーザー読み取り可。

---

## 設計上の決定事項・注意点

- **献立生成はLLM不使用** — レシピDBからのアルゴリズム生成（Route Handler内で実行）
- **ペルソナUI** — 6キャラ（mei/arisa/tsuzuri/iris/cleio/milra）の口調切替（Phase 4）
- **UIテーマ** — Blue Archive風パステル + 軍用HUDアクセント、CSS変数で管理
- **モックデータ優先** — Supabase未接続でも動作確認できる構造にする
- **栄養価は1人あたり表示** — 人数で割って算出
