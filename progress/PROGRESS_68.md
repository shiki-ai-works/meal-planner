# PROGRESS_68

> **setup 画面への doctor 導線追加** — 2026-05-25

`setup:doctor` は端末では使えるようになった。今回はその存在を `/setup` 画面にも出した。井戸の場所を知っていても、地図に印が無ければ旅人は水を探してしまう。

## やったこと

### Step 1: `/setup` にローカル診断コマンドを表示

`src/app/setup/page.tsx` の `.env.local` セクションに、次のコマンドを追加した。

```powershell
npm run setup:doctor
```

`.env.local` を作った後、ブラウザを開く前に未設定・仮値・URL 形式違いを確認できる。

### Step 2: JSON 診断の導線も追加

自動化や記録に使うための JSON 出力も同じ画面から確認できるようにした。

```powershell
npm run --silent setup:doctor:json
```

`--silent` は npm の実行見出しを消す指定だ。JSON だけを取り出したいときに使う。

### Step 3: README と ROADMAP を更新

README に、同じ doctor 案内が `/setup` にも表示されることを追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_68` へ進めた。

## 確認したこと

- `/setup` で `npm run setup:doctor` が見える
- `/setup` で `npm run --silent setup:doctor:json` が見える
- 既存の `.env.local` 例と診断 JSON 導線は残っている

## 検証コマンド

```powershell
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `手元で診断する`、`npm run setup:doctor`、`npm run --silent setup:doctor:json` を確認）

## 変更ファイル

- `src/app/setup/page.tsx`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_68.md`
