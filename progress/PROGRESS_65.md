# PROGRESS_65

> **一括 check script 追加** — 2026-05-25

前回 `typecheck` script を追加したので、今回は検査一式を一つの入口にまとめた。個々の火を見回る番人を置くより、ひとつの鐘で全員を呼べる方が、夜番は迷わない。

## やったこと

### Step 1: `package.json` に `check` を追加

`npm run check` で次を順番に実行するようにした。

```powershell
npm run typecheck
npm run lint
npm run build
```

実体は次の script だ。

```json
"check": "npm run typecheck && npm run lint && npm run build"
```

`&&` は、前の命令が成功した時だけ次へ進む連結記号だ。途中で型検査や lint が落ちれば、build まで進まずに止まる。

### Step 2: README の検査手順を更新

`## 検査` に、まとめて確認する手順と個別に確認する手順を併記した。

```powershell
npm run check
```

個別確認では、引き続き次を確認できる。

```powershell
npm run typecheck
npm run lint
npm run build
git diff --check
```

### Step 3: ROADMAP を更新

完了済み項目、Now、関連ドキュメントを `PROGRESS_65` へ進めた。

## 確認したこと

- `npm run check` が typecheck / lint / build を順に実行する
- README の検査手順が一括実行と個別実行の両方を案内する
- `/setup` はブラウザで引き続き開ける

## 検証コマンド

```powershell
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `SETUP REQUIRED` と診断 JSON 導線を確認）

## 変更ファイル

- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_65.md`
