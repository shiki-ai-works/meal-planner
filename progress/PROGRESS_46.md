# 超献立プランナー 開発進捗 #46

> **画像 URL manifest 診断 next actions** — 2026-05-25

前回の report は、manifest の状態を数字で見せる温度計になった。今回は、その温度計に「次はここを直せ」と小さな札を付けた。数字だけでは人は迷う。故に、次の一手まで近くに置く。

---

## 何をやったか

### Step 1: report に `next actions` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

`--report` の末尾に `next actions` を出すようにした。

案内する内容:

- error がある場合は、下に出る error を直す
- 空の `image_urls` がある場合は、残件数ぶん URL を入れる
- `example.com` 仮 URL がある場合は、実 URL に置き換える
- invalid URL がある場合は、形式を直す
- 重複 URL がある場合は、重複を消す
- ready 状態なら、`recipe-images:migration` 実行コマンドを表示する

### Step 2: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には、report が `next actions` を出すことを追記した。ROADMAP には PROGRESS_46 として現在地を反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:report -- supabase\recipe-images.template.json
node scripts\generate-recipe-image-sql.mjs --report supabase\.recipe-images-report-ready-test.json
npm.cmd run recipe-images:check-template
npm.cmd run recipe-images:template
npm.cmd run recipe-images:check-generated-template
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

期待どおり失敗:

```powershell
npm.cmd run recipe-images:report -- supabase\recipe-images.example.json
```

確認した出力:

- template manifest は `fill image_urls for 35 recipe mapping(s)` を表示
- example manifest は `fix the errors listed below` と `replace 2 example.com image URL(s)` を表示
- ready 用の一時 manifest は `run npm.cmd run recipe-images:migration -- ...` を表示
- ready 用の一時 manifest は検証後に削除

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_46.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` を土台に、実際の画像 URL を入れる manifest を作る。

### 2. report の `next actions` をゼロへ近づける

`fill image_urls`、`replace example.com`、`fix errors` が出なくなるまで manifest を整える。

### 3. `recipe-images:migration` を実 URLで通す

report が `ready for recipe-images:migration: yes` になったら、`007_recipe_images.sql` を生成する。
