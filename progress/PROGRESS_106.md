# PROGRESS_106

> **portfolio asset check 自己検査** - 2026-05-26

PROGRESS_105 でスクリーンショット参照の検査を足したので、今回はその検査自身を点検できるようにした。道しるべを見る係にも、目が曇っていないか確かめる小さな鏡を持たせた感じだよ。

## やったこと

### Step 1: 拡張子と中身の一致まで確認

`scripts/check-portfolio-assets.mjs` を強化し、JPEG / PNG signature を見るだけでなく、拡張子と中身が一致するかも確認するようにした。

- `.jpg` / `.jpeg` は JPEG signature が必要
- `.png` は PNG signature が必要

これで、JPEG なのに `.png` という前回見つけた事故が戻った場合も止まる。

### Step 2: 自己検査を追加

`scripts/check-portfolio-assets.test.mjs` を追加した。

一時フォルダに小さな README / PORTFOLIO / portfolio 画像を作り、次のケースを検査する。

- 正しい JPEG / PNG 参照は pass
- 参照先が missing の場合は fail
- `.png` 参照なのに中身が JPEG の場合は fail

missing は「参照先が存在しない」こと、mismatch は「名前と中身が食い違う」ことだね。

### Step 3: 通常検査に組み込み

`portfolio:check:test` を `package.json` に追加し、`npm run check` に組み込んだ。

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も、自己検査込みの説明へ更新した。

## 確認したこと

- `npm.cmd run portfolio:check:test` -> pass
- `npm.cmd run portfolio:check` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（改行コード warning のみ）

## 変更ファイル

- `scripts/check-portfolio-assets.mjs`
- `scripts/check-portfolio-assets.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_106.md`
