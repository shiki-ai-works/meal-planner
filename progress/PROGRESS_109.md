# PROGRESS_109

> **progress index check 追加** - 2026-05-26

進捗メモは、航海日誌みたいなものだよ。日誌だけ増えて ROADMAP が古いままだと、次に触る人がどの島に着いたのかわからなくなる。今回はそのずれを通常検査で拾えるようにした。

## やったこと

### Step 1: progress index checker を追加

`scripts/check-progress-index.mjs` を追加した。
この script は、`progress/PROGRESS_NN.md` のうち数字だけの名前を数値順に見て、最新 note を決める。

確認すること:

- 最新 note の 1 行目が `# PROGRESS_NN` になっている
- `ROADMAP.md` の `最終更新` 行が最新 note を指している
- `ROADMAP.md` の関連ドキュメントに `progress/PROGRESS_NN.md` へのリンクがある

古い `PROGRESS_01_2.md` のような非標準名は、最新判定からは外して数だけ表示する。

### Step 2: 自己検査を追加

`scripts/check-progress-index.test.mjs` を追加した。
一時フォルダに小さな `progress/` と `ROADMAP.md` を作り、次のケースを確認する。

- 正しい最新 note と ROADMAP は pass
- 最新 note への ROADMAP link が無い場合は fail
- 最新 note の heading がずれている場合は fail
- 非標準 progress note は最新判定から外す

### Step 3: 通常検査へ組み込み

`docs:progress-index` と `docs:progress-index:test` を `package.json` に追加し、`npm run check` に組み込んだ。
README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も、検査の説明と最新進捗に合わせて更新した。

## 確認したこと

- `npm.cmd run docs:progress-index:test` -> pass
- `npm.cmd run docs:progress-index` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass

## 変更ファイル

- `scripts/check-progress-index.mjs`
- `scripts/check-progress-index.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_109.md`
