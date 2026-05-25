# 超献立プランナー 開発進捗 #40

> **本番投入向け画像 manifest strict 検査** — 2026-05-25

画像 URL の雛形、生成、一致検査までは整った。今回は、本番投入の直前に使う厳しい検査を追加した。ふだんは「注意」で済ませる仮 URL や重複 URL も、本番の門では通さない。紙の切符で汽車には乗れぬ、という具合だな。

---

## 何をやったか

### Step 1: `--strict` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加内容:

- 通常は warning の内容を strict モードでは error に変換
- `example.com` の仮 URL を本番前に止める
- 同一レシピ内の重複 URL を本番前に止める
- `--strict` と `--allow-empty` の併用を禁止

strict は厳格モードのことだ。普段の下書き検査では見逃す注意点も、本番投入前には失敗として扱う。

### Step 2: npm script を追加

変更:

- `package.json`

追加:

```json
"recipe-images:check-strict": "node scripts/generate-recipe-image-sql.mjs --check --strict --require-seed-recipes"
```

使い方:

```powershell
npm.cmd run recipe-images:check-strict -- supabase\recipe-images.actual.json
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、本番投入前に strict 検査を使う流れを追記した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:check-generated-template
npm.cmd run recipe-images:template
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

期待どおり失敗:

```powershell
npm.cmd run recipe-images:check-strict -- supabase\recipe-images.example.json
```

理由:

- example manifest は 35 件の seed を cover していない
- `example.com` の仮 URL が残っている

追加確認:

- 一時的に 35 件すべてへ `https://images.invalid/...` を入れた manifest を生成し、`--check --strict --require-seed-recipes` が通過することを確認
- 一時 manifest は検査後に削除

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_40.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` の出力を土台に、実際の画像 URL を入れる manifest を作る。

### 2. strict 検査から SQL 生成へ進める

実 URL manifest に `recipe-images:check-strict` を通し、通ったものだけ SQL 生成へ進める。

### 3. 画像ソースを決める

AI 生成画像を Supabase Storage に置くか、手動 URL で代表画像から始めるかを決める。
