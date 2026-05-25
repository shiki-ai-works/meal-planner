# PROGRESS_108

> **Markdown mojibake check 追加** - 2026-05-26

日本語の README や handoff は、次に触る人のための地図だよ。文字化けが混ざると、道の名前が読めなくなる。今回はその事故を通常検査で拾えるようにした。

## やったこと

### Step 1: mojibake checker を追加

`scripts/check-doc-mojibake.mjs` を追加した。

この script は、主要 Markdown と `progress/PROGRESS_*.md` を読み、UTF-8 の読み違えで生まれやすい断片を検出する。

対象の例:

- `README.md`
- `PORTFOLIO.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `DEPLOYMENT.md`
- `progress/PROGRESS_*.md`

mojibake は文字化けのこと。たとえば日本語が別の文字コードとして読まれて、意味のある文が記号の列みたいになる状態だね。

### Step 2: 自己検査を追加

`scripts/check-doc-mojibake.test.mjs` を追加した。

一時フォルダに小さな Markdown を作り、次を確認する。

- 正しい日本語文書は pass
- 文字化け断片を含む文書は fail
- 存在しない文書指定は fail

### Step 3: 通常検査へ組み込み

`docs:mojibake` と `docs:mojibake:test` を `package.json` に追加し、`npm run check` に組み込んだ。

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も、文字化け検査込みの説明へ更新した。

## 確認したこと

- `npm.cmd run docs:mojibake:test` -> pass
- `npm.cmd run docs:mojibake` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（改行コード warning のみ）

## 変更ファイル

- `scripts/check-doc-mojibake.mjs`
- `scripts/check-doc-mojibake.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_108.md`
