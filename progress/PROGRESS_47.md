# 超献立プランナー 開発進捗 #47

> **画像 URL 未入力レシピ一覧** — 2026-05-25

report で「35 件足りない」と分かるようになったので、今回は「どの 35 件か」をそのまま一覧できるようにした。数は地図の縮尺で、名前は道標だ。道標があれば、画像 URL 集めの手が止まりにくい。

---

## 何をやったか

### Step 1: `--list-missing-images` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

`--list-missing-images` は、`image_urls` が空のレシピ名だけを一覧する。SQL は生成しない。

### Step 2: `recipe-images:missing` を追加

変更:

- `package.json`

追加:

```json
"recipe-images:missing": "node scripts/generate-recipe-image-sql.mjs --list-missing-images --allow-empty --require-seed-recipes"
```

使い方:

```powershell
npm.cmd run recipe-images:missing -- supabase\recipe-images.template.json
```

雛形 manifest では、URL 未入力の 35 件をすべて一覧する。

### Step 3: README / ROADMAP を更新

変更:

- `README.md`
- `ROADMAP.md`

README には未入力レシピ名だけを一覧するコマンドを追記し、ROADMAP には PROGRESS_47 として反映した。

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:missing -- supabase\recipe-images.template.json
node scripts\generate-recipe-image-sql.mjs --list-missing-images supabase\recipe-images.example.json
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
npm.cmd run recipe-images:missing -- supabase\recipe-images.example.json
```

理由:

- example manifest は画像 URL 自体は入っている
- しかし seed 35 件を cover しておらず、seed に無いレシピ名も含む

確認した出力:

- template manifest は URL 未入力の 35 件を一覧
- seed coverage なしの直接実行では、example manifest が `OK: no recipe image mappings are missing image URLs` を返す
- seed coverage ありの npm script では、example manifest が seed 不一致で失敗

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_47.md`

---

## 次にやること

### 1. 実 URL 入力用 manifest を作る

`recipe-images:missing` の一覧を見ながら、`image_urls` を埋める。

### 2. report で残件数を減らす

`recipe-images:report` が `recipes missing image URLs: 0` になるまで埋める。

### 3. strict migration 生成へ進む

report が `ready for recipe-images:migration: yes` になったら、`recipe-images:migration` を実行する。
