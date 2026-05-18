# 超献立プランナー 開発進捗 #02

> **GitHub連携セットアップ** — 2026-05-18

## このセッションでやったこと

### GitHub連携
- **gh CLI v2.92.0** を winget でインストール
- GitHub アカウント `shiki-ai-works` で認証 (HTTPS / web flow)
- `meal-planner/` をローカル git リポジトリ化 (main ブランチ)
- 引き継ぎメモ「新規 テキスト ドキュメント (5).txt」を `progress/PROGRESS_01_2.md` にリネーム移動
- GitHub 上に **private リポジトリ** を作成し initial commit を push
  - URL: https://github.com/shiki-ai-works/meal-planner
  - 37 ファイル / 9000 行超

### 確認事項
- `.gitignore` で `.env*` (除く `.env.example`) が除外対象になっていることを確認
  → Supabase Service Role キーなどの秘匿情報は push されていない
- 初回 commit author は `shiki-ai-works <shiki-ai-works@users.noreply.github.com>` (privacy保護)

## リポジトリ状態

```
ローカル: D:\ClaudeCode_project\meal-planner
リモート: origin → https://github.com/shiki-ai-works/meal-planner (private)
ブランチ: main (origin/main を tracking)
```

## 次にやること（推奨順）

PROGRESS_01_2.md の続きを継続:

1. **API ルート `/api/generate-plan`** を作る
2. **ミールカードコンポーネント** を作る
3. **ダッシュボード本体** を実装

加えて GitHub 連携後の運用面:

- 通常の更新フローは `git add` → `git commit` → `git push`
- 機能ごとにブランチを切る場合: `git switch -c feat/xxx` → push → `gh pr create`
- 必要に応じて GitHub Actions (lint/typecheck) を追加検討

## 注意点

- `.env.local` は **絶対にcommitしない** (gitignore済みだが新規env系ファイル追加時は要確認)
- Service Role キーには `NEXT_PUBLIC_` を付けない
- `AGENTS.md` の Next.js バージョン注意は継続有効
