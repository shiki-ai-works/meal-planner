# PROGRESS_103

> **release check strict 化** — 2026-05-26

PROGRESS_102 で画像出典の placeholder attribution が 0 件になったので、今回は公開前の門を少し固くした。警告を見つける道具から、警告が戻った時にちゃんと止める門番へ役割を進めた形だよ。

## やったこと

### Step 1: `release:check` を strict 出典検査へ変更

`package.json` の `release:check` を、通常の `recipe-images:sources-check` ではなく `recipe-images:sources-check:strict` に差し替えた。

これで author / license の placeholder や source note warning が戻った場合、公開前検査が失敗する。strict は「警告も失敗扱いにする」確認だね。

### Step 2: ドキュメントを同じ前提へ更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP の説明を、strict 検査込みの `release:check` に合わせた。

特に DEPLOYMENT では、`release:check` 自体が strict 出典検査を含むことを明記し、単独コマンドは「画像出典だけを強めに確認する時」の案内へ整理した。

## 確認したこと

- `npm.cmd run recipe-images:sources-check:strict` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（改行コード warning のみ）
- `http://localhost:3000/setup` -> HTTP 200

## 変更ファイル

- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_103.md`
