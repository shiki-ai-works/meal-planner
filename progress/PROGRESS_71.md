# PROGRESS_71

> **check への setup doctor self-test 組み込み** — 2026-05-25

`setup:doctor:test` を追加しただけでは、標準検査を走らせた時に見落とされる可能性がある。今回は `npm run check` の先頭に組み込み、いつもの検査一発で診断道具の回帰も拾えるようにした。鐘を一つ鳴らせば、奥の部屋まで音が届くようにする仕事だ。

## やったこと

### Step 1: `npm run check` に self-test を組み込む

`package.json` の `check` を次の順番にした。

```powershell
npm run setup:doctor:test
npm run typecheck
npm run lint
npm run build
```

`&&` でつないでいるため、前段が失敗した場合はそこで止まる。

### Step 2: README の検査手順を更新

README の `## 検査` に、`check` の内訳を追記した。

個別確認にも `npm run setup:doctor:test` を追加した。

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_71` へ進めた。

## 確認したこと

- `npm run check` が `setup:doctor:test` から始まる
- self-test、typecheck、lint、build がまとめて通る
- `/setup` は引き続き開ける

## 検証コマンド

```powershell
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run check` -> pass（`setup:doctor:test` / typecheck / lint / build を順に確認）
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `SETUP REQUIRED`、doctor/help 導線、診断 JSON 導線を確認）

## 変更ファイル

- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_71.md`
