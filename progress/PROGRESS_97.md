# PROGRESS_97

> **source notes report 追加** — 2026-05-25

画像出典メモの strict 検査で warning を止められるようになったので、次は「どこを直すか」を一目で見えるようにした。`source report` は、出典ページの住所を並べる作業地図だよ。

## やったこと

### Step 1: `--sources-report` を追加

`scripts/generate-recipe-image-sql.mjs` に `--sources-report` を追加した。

出力内容:

- actual manifest の path
- source notes の path
- expected recipe image URL 数
- source note 数
- placeholder attribution warning 数
- warning / error 数
- 次に取る action
- 再確認対象の recipe / source / image / author / license

### Step 2: package script を追加

`package.json` に次を追加した。

```powershell
npm.cmd run recipe-images:sources-report
```

### Step 3: 自己検査を追加

`scripts/generate-recipe-image-sql.test.mjs` に、placeholder attribution warning がある時の report 出力と、warning がない時の strict 案内を確認する test を追加した。

### Step 4: README / DEPLOYMENT / handoff / ROADMAP を更新

通常確認は `recipe-images:sources-check`、修正対象の一覧は `recipe-images:sources-report`、最終公開前の厳格確認は `recipe-images:sources-check:strict` と役割を分けて書いた。

## 確認したこと

- `npm.cmd run recipe-images:workflow:test` -> pass
- `npm.cmd run recipe-images:sources-report` -> pass（9 件の placeholder attribution warning を source page URL つきで表示）
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- `http://localhost:3000/setup` HTTP 確認 -> 200

`release:check` の中で、setup doctor 自己検査、画像 workflow 自己検査、E2E script 自己検査、workflow 診断、typecheck、lint、build、source notes check、公開導線 E2E が通った。

## 現在の report 結果

`recipe-images:sources-report` は 35 件の source note を読み、placeholder attribution warning 9 件を一覧する。

対象:

- トースト＋目玉焼き＋サラダ
- ヨーグルトパフェ
- 豚汁定食
- パスタ ナポリタン
- 蒸し鶏の冷やしうどん
- 親子丼
- ぶり大根
- バンバンジー（棒棒鶏）
- 鶏とごろごろ野菜のクリームシチュー

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `scripts/generate-recipe-image-sql.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `ROADMAP.md`
- `NEXT_CHAT_HANDOFF.md`
- `progress/PROGRESS_97.md`
