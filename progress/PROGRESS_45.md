# 超献立プランナー 開発進捗 #45

> **画像 URL manifest 診断レポート** — 2026-05-25

画像 URL の道具は、検査、SQL 生成、migration 保存まで揃ってきた。今回は、実 URL を入れる前後に「何が残っているか」を一目で見られる report（診断レポート）を足した。山に入る前に地図を見るようなものだ。どの峰が残っているか分かれば、足取りは乱れにくい。

---

## 何をやったか

### Step 1: `--report` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

`--report` は SQL を生成せず、manifest の状態を表示する。

表示する内容:

- レシピ件数
- seed レシピの期待件数
- 画像 URL 入力済み件数
- 空の `image_urls` 件数
- 画像 URL 総数
- `example.com` 仮 URL 件数
- 重複 URL 件数
- invalid URL（形式不正 URL）件数
- warning / error 件数
- `recipe-images:migration` へ進める状態かどうか

### Step 2: `recipe-images:report` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:report": "node scripts/generate-recipe-image-sql.mjs --report --allow-empty --require-seed-recipes"
```

使い方:

```powershell
npm.cmd run recipe-images:report -- supabase\recipe-images.template.json
```

`--allow-empty` を含めているので、URL 未投入の雛形でも「残り 35 件」のように診断できる。

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README に report の使い方を追記し、ROADMAP に PROGRESS_45 として現在地を反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:report -- supabase\recipe-images.template.json
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

理由:

- example manifest は seed 35 件を cover していない
- seed に無いレシピ名が入っている
- `example.com` の仮 URL が残っている

確認した出力:

- template manifest は `recipes missing image URLs: 35`
- template manifest は `ready for recipe-images:migration: no`
- example manifest は seed coverage error と仮 URL warning を表示

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_45.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:template` を土台に、実際の画像 URL を入れる manifest を作る。

### 2. `recipe-images:report` で残件数を潰す

report が `ready for recipe-images:migration: yes` になるまで、空 URL、仮 URL、重複 URL を潰す。

### 3. `recipe-images:migration` を実 URL で通す

実 URL manifest が整ったら、`supabase/migrations/007_recipe_images.sql` を生成する。
