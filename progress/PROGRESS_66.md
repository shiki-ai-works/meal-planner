# PROGRESS_66

> **Supabase setup doctor 追加** — 2026-05-25

Supabase の鍵は、画面に着く前につまずきやすい。今回は `.env.local` を手元で診断する `setup:doctor` を追加した。橋を渡る前に板の緩みを見ておく、そういう小さな用心だ。

## やったこと

### Step 1: 診断 script を追加

`scripts/check-supabase-env.mjs` を追加した。

この script は次を読み取る。

```text
.env
.env.development.local
.env.local
```

後に読まれたファイルほど優先されるため、`.env.local` が最優先になる。

診断する値は次の 2 つだけだ。

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

鍵そのものは出力しない。どのファイルに値があるか、未設定か、仮値か、URL 形式が正しいかだけを表示する。

### Step 2: npm script を追加

`package.json` に次を追加した。

```json
"setup:doctor": "node scripts/check-supabase-env.mjs",
"setup:doctor:strict": "node scripts/check-supabase-env.mjs --strict"
```

`setup:doctor` は診断結果を表示する。`setup:doctor:strict` は、問題がある場合に終了コードも失敗にする。

### Step 3: README と ROADMAP を更新

README の Supabase 設定に、ブラウザを開く前の診断手順を追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_66` へ進めた。

## 確認したこと

- Supabase 公開 URL / 公開 key の不足を検出できる
- `.env.example` の仮値を検出できる
- URL 形式違いを検出できる
- 鍵そのものを出力しない

## 検証コマンド

```powershell
npm.cmd run setup:doctor
npm.cmd run setup:doctor:strict
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run setup:doctor` -> pass（`.env.local` 未作成を `required` として診断）
- `npm.cmd run setup:doctor:strict` -> expected fail（`.env.local` 未作成のため終了コード 1）
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `SETUP REQUIRED`、`.env.local` の形、診断 JSON 導線を確認）

## 変更ファイル

- `scripts/check-supabase-env.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_66.md`
