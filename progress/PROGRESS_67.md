# PROGRESS_67

> **Supabase setup doctor JSON 出力** — 2026-05-25

`setup:doctor` は人に読ませる診断として整った。今回は機械にも読ませられるよう、JSON 出力を追加した。言葉の手紙に加えて、番地の揃った台帳を渡すようなものだ。

## やったこと

### Step 1: `--json` を追加

`scripts/check-supabase-env.mjs` に `--json` を追加した。

JSON 出力には次を含める。

```json
{
  "ok": false,
  "status": "required",
  "setupPath": "/setup",
  "envFiles": [],
  "requiredKeySources": {},
  "missingKeys": [],
  "issues": [],
  "nextSteps": []
}
```

鍵そのものは出さない。`requiredKeySources` も、どの env ファイルに値があったかだけを示す。

### Step 2: npm script を追加

`package.json` に次を追加した。

```json
"setup:doctor:json": "node scripts/check-supabase-env.mjs --json"
```

自動処理で npm の実行バナーを消したい場合は、次のように `--silent` を付ける。

```powershell
npm run --silent setup:doctor:json
```

`setup:doctor:strict -- --json` のように組み合わせれば、JSON で出しつつ問題がある時に終了コードも失敗にできる。

### Step 3: README と ROADMAP を更新

README に JSON 出力の使いどころを追記した。

ROADMAP の完了済み項目、Now、関連ドキュメントを `PROGRESS_67` へ進めた。

## 確認したこと

- `npm run setup:doctor:json` が JSON として parse できる
- JSON に Supabase URL や anon key の実値を含めない
- 通常の `setup:doctor` 出力も引き続き読める

## 検証コマンド

```powershell
npm.cmd run setup:doctor
npm.cmd run --silent setup:doctor:json
npm.cmd run --silent setup:doctor:strict -- --json
npm.cmd run check
git diff --check
```

## 結果

- `npm.cmd run setup:doctor` -> pass（`.env.local` 未作成を `required` として診断）
- `npm.cmd run --silent setup:doctor:json` -> pass（JSON parse 確認済み）
- `npm.cmd run --silent setup:doctor:strict -- --json` -> expected fail（`.env.local` 未作成のため終了コード 1、JSON 出力は成功）
- `npm.cmd run check` -> pass
- `git diff --check` -> pass（CRLF 警告のみ）
- ブラウザ確認 -> pass（`/setup` で `SETUP REQUIRED`、`.env.local` の形、診断 JSON 導線を確認）

## 変更ファイル

- `scripts/check-supabase-env.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_67.md`
