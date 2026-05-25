# 超献立プランナー 開発進捗 #35

> **レシピ画像 manifest 検証導線** — 2026-05-25

次の大きな残件である `recipes.image_urls` 投入に向けて、manifest JSON を SQL 化する前の検品台を作った。写真 URL は、いわば料理に貼る名札だ。名札が空だったり、同じ料理が二枚あったりすると、あとで食卓が混乱する。故に、SQL 生成前に止められるようにした。

---

## 何をやったか

### Step 1: SQL 生成スクリプトに `--check` を追加

変更:

- `scripts/generate-recipe-image-sql.mjs`

追加内容:

- `--check` オプション
- manifest の構造検証
- レシピ名の空チェック
- レシピ名の重複チェック
- `image_urls` の配列チェック
- 空 URL チェック
- `http` / `https` URL 形式チェック
- `example.com` 仮 URL の警告

### Step 2: npm script を追加

変更:

- `package.json`

追加:

```json
"recipe-images:check": "node scripts/generate-recipe-image-sql.mjs --check"
```

### Step 3: README に検証手順を追記

変更:

- `README.md`

追加内容:

```powershell
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
```

---

## 検証

通過:

```powershell
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
npm.cmd exec tsc -- --noEmit
npm run lint
npm run build
```

確認:

- example manifest は 2 件の mapping として valid
- `example.com` の仮 URL は warning として表示
- SQL 生成は従来どおり実行可能

---

## 変更ファイル

- `scripts/generate-recipe-image-sql.mjs`
- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_35.md`

---

## 次にやること

### 1. 35 件用 manifest 雛形の拡張

全レシピ名を含む manifest 雛形を用意し、URL だけ差し替えればよい状態に近づける。

### 2. 実 URL の調達方針決定

AI 生成、Supabase Storage、手動 URL のどれで進めるか決める。

### 3. 実 Supabase 環境での投入確認

`.env.local` が入ったら、生成 SQL を Supabase SQL Editor で試し、カードと詳細画面に写真が出るか確認する。
