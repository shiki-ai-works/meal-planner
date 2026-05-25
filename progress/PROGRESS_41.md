# 超献立プランナー 開発進捗 #41

> **strict SQL 生成導線** — 2026-05-25

strict 検査で門を作ったので、今回はその門を通った manifest だけ SQL 生成へ進める短縮コマンドを足した。検査と投入が別々の小道にあると、人は急ぐ日に近道をしてしまう。故に、正しい道を歩きやすくするのが肝要だな。

---

## 何をやったか

### Step 1: `recipe-images:sql-strict` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:sql-strict": "node scripts/generate-recipe-image-sql.mjs --strict --require-seed-recipes"
```

使い方:

```powershell
npm.cmd run recipe-images:sql-strict -- supabase\recipe-images.actual.json
```

このコマンドは、seed レシピ 35 件を cover し、警告も出ない manifest だけ SQL にする。`example.com` の仮 URL や重複 URL がある場合は SQL を出さずに止まる。

### Step 2: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、strict 検査を通った manifest から SQL を生成する手順を追記した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:sql-strict -- supabase\.recipe-images-sql-strict-test.json
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
npm.cmd run recipe-images:sql-strict -- supabase\recipe-images.example.json
```

理由:

- example manifest は 35 件の seed を cover していない
- `example.com` の仮 URL が残っている

追加確認:

- 一時的に 35 件すべてへ `https://images.invalid/...` を入れた manifest を生成し、strict SQL 生成が SQL を出すことを確認
- 一時 manifest は検査後に削除

---

## 変更ファイル

- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_41.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` の出力を土台に、実際の画像 URL を入れる manifest を作る。

### 2. 画像ソースを決める

AI 生成画像を Supabase Storage に置くか、手動 URL で代表画像から始めるかを決める。

### 3. strict SQL を実 URL で通す

実 URL manifest に `recipe-images:sql-strict` を通し、Supabase SQL Editor に貼れる SQL を得る。
