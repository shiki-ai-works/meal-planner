# 超献立プランナー 開発進捗 #39

> **保存済み画像 manifest 雛形の生成一致検査** — 2026-05-25

前回は seed から雛形を出せるようにした。今回は、その出力と保存済みの `supabase/recipe-images.template.json` が一致するか、専用コマンドで確かめられるようにした。写本が正しいかを元帳と照らす。たった一行の検査だが、後日のずれを防ぐ小さな番人になる。

---

## 何をやったか

### Step 1: `--check-generated-template` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加内容:

- seed から生成した雛形 manifest を作る
- 指定された manifest JSON を読み込む
- 両方を正規化して比較
- 一致すれば OK を表示
- 一致しなければ、seed 変更後に template 更新が必要なことをエラーで示す

正規化とは、JSON の空白や改行差に惑わされないよう、同じ形へ整えることだ。

### Step 2: npm script を追加

変更:

- `package.json`

追加:

```json
"recipe-images:check-generated-template": "node scripts/generate-recipe-image-sql.mjs --check-generated-template supabase/recipe-images.template.json"
```

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、保存済み雛形が seed 生成結果と一致するか確認する手順を追記した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:check-generated-template
node scripts\generate-recipe-image-sql.mjs --check-generated-template supabase\recipe-images.template.json
npm.cmd run recipe-images:template
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
git diff --check
```

確認:

- 保存済み template は seed から生成した 35 件の雛形と一致
- template 出力、template 検査、example manifest 検査、SQL 生成は通過
- `git diff --check` は終了コード 0。CRLF 変換予定の warning のみ

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_39.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` の出力を土台に、実際の画像 URL を入れる作業用 manifest を作る。

### 2. 実 URL 投入前の検査セットを固める

実 URL manifest に対して、通常検査、seed coverage、SQL 生成を一続きで確認する導線を整える。

### 3. 画像ソースを決める

AI 生成画像を Supabase Storage に置くか、手動 URL で代表画像から始めるかを決める。
