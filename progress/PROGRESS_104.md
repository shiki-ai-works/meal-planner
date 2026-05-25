# PROGRESS_104

> **portfolio case study と demo deep link 整備** - 2026-05-26

README の冒頭を、技術者ポートフォリオとして読まれやすい構成に寄せた。
あわせて、採用・案件提案でそのまま説明に使える `PORTFOLIO.md` を追加した。

## やったこと

### Step 1: README 冒頭を作品紹介寄りに変更

`README.md` の最初に、次の内容を置いた。

- 何を作ったか
- 誰の課題を解くか
- 技術構成
- スクリーンショット
- 技術的な見どころ
- demo deep link

横文字の意味が伝わるように、Route Handler、migration、E2E などには短い説明も添えた。

### Step 2: スクリーンショットを追加

実ブラウザで主要画面を開き、`public/portfolio/` に保存した。

- `demo-dashboard.png`
- `demo-week-plan.png`
- `demo-shopping-list.png`
- `demo-recipe-detail.png`
- `legal-overview.png`

### Step 3: demo deep link を追加

ポートフォリオ閲覧者が目的の画面へ直接飛べるようにした。

- `/demo?section=shopping`
- `/demo?recipe=demo-natto-rice`

query string は URL の `?` 以降につく追加指定のこと。
本でいえば、表紙からではなく、しおりのあるページを直接開くようなものだね。

### Step 4: 公開導線 E2E に deep link を追加

`scripts/e2e-public-flow.mjs` の公開前チェックに、demo deep link も含めた。
E2E は end-to-end の略で、入口から出口までをまとめて確認する検査。

### Step 5: Portfolio case study を追加

`PORTFOLIO.md` を追加し、次の観点で作品説明をまとめた。

- 作品概要
- 想定ユーザー
- 技術構成
- 技術的な見どころ
- 検査コマンド
- 現在の制約
- 次に改善すると強い点
- 面接・案件提案で話せること

## 確認したこと

- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（改行コード warning のみ）
- Browser deep link check -> pass
- port `3000` / `3210` に残ったローカルサーバーなし

## 変更ファイル

- `README.md`
- `PORTFOLIO.md`
- `public/portfolio/`
- `src/app/demo/DemoClient.tsx`
- `scripts/e2e-public-flow.mjs`
- `scripts/e2e-public-flow.test.mjs`
- `next.config.ts`
- `progress/PROGRESS_104.md`
