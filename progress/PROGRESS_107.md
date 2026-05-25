# PROGRESS_107

> **Markdown local link check 追加** - 2026-05-26

README や ROADMAP は、次の作業者が迷わないための地図だよ。今回はその地図の中のローカルリンクが、実在するファイルへつながっているかを自動で確認する検査を追加した。

## やったこと

### Step 1: docs link checker を追加

`scripts/check-doc-links.mjs` を追加した。

この script は次の Markdown を読み、ローカルファイルへのリンクが存在するか確認する。

- `README.md`
- `PORTFOLIO.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `DEPLOYMENT.md`

外部 URL とアプリ route（例: `/demo`）は対象外にした。外部 URL はネットワーク状態で揺れやすく、route はファイルではなくアプリの画面だからだね。

### Step 2: 自己検査を追加

`scripts/check-doc-links.test.mjs` を追加した。

一時フォルダに小さな文書セットを作り、次を確認する。

- 正しいローカルリンクは pass
- 存在しないローカルファイル参照は fail
- 外部 URL とアプリ route は skip
- fenced code block 内の Markdown 例は skip

fenced code block は ``` で囲まれたコード例のこと。説明用の例まで本物のリンクとして追わないようにした。

### Step 3: 通常検査へ組み込み

`docs:links` と `docs:links:test` を `package.json` に追加し、`npm run check` に組み込んだ。

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も、文書リンク検査込みの説明へ更新した。

## 確認したこと

- `npm.cmd run docs:links:test` -> pass
- `npm.cmd run docs:links` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（改行コード warning のみ）

## 変更ファイル

- `scripts/check-doc-links.mjs`
- `scripts/check-doc-links.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_107.md`
