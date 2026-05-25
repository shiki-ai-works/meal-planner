# PROGRESS_105

> **portfolio asset check 追加** - 2026-05-26

README と `PORTFOLIO.md` にスクリーンショットが入ったので、今回は画像参照が壊れていないかを自動で見る検査を足した。文章が地図なら、画像は道しるべだよ。道しるべが消えたまま公開されないようにする。

## やったこと

### Step 1: portfolio asset checker を追加

`scripts/check-portfolio-assets.mjs` を追加した。

この script は `README.md` と `PORTFOLIO.md` の Markdown 画像参照を読み取り、`public/portfolio/*.jpg` などの portfolio 画像が次の条件を満たすか確認する。

- ファイルが存在する
- 空ファイルではない
- JPEG / PNG signature を持つ

signature は画像ファイルの先頭にある決まった目印だよ。封筒の差出人欄みたいに、最低限「これは JPEG / PNG です」と判断できる。

追加時の検査で、既存スクリーンショットは中身が JPEG なのに拡張子が `.png` になっていることが分かったため、`public/portfolio/*.jpg` へ改名し、README / PORTFOLIO の参照も合わせた。

### Step 2: npm script と通常検査へ組み込み

`package.json` に `portfolio:check` を追加し、`npm run check` の中にも組み込んだ。

これで README や case study の画像リンクが壊れた場合、通常検査で止まる。

### Step 3: ドキュメントを更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、`portfolio:check` が通常検査に含まれることを追記した。

## 確認したこと

- `npm.cmd run portfolio:check` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass（改行コード warning のみ）

## 変更ファイル

- `scripts/check-portfolio-assets.mjs`
- `package.json`
- `README.md`
- `PORTFOLIO.md`
- `public/portfolio/`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_105.md`
