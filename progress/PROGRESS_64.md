# 献立プランナー 開発進捗 #64

> **typecheck script 追加** — 2026-05-25

ここまで型検査は `npm.cmd exec tsc -- --noEmit` を直接叩いていた。今回は `package.json` に `typecheck` script を追加し、検査の入口を `npm run typecheck` に揃えた。井戸へ降りる梯子は、毎回その場で組むより、同じ場所に掛けておく方がよい。

---

## 何をやったか

### Step 1: `package.json` に typecheck を追加

変更:

- `package.json`

追加:

```json
"typecheck": "tsc --noEmit"
```

これで TypeScript の型検査を `npm run typecheck` で実行できる。

### Step 2: README の検査手順を更新

変更:

- `README.md`

`npm run typecheck` が未定義という古い注意書きを削除し、検査手順を次の形に揃えた。

```powershell
npm run typecheck
npm run lint
npm run build
git diff --check
```

### Step 3: ROADMAP に反映

変更:

- `ROADMAP.md`

開発環境の検査手順と Now を、`typecheck` script 前提に更新した。

---

## 検証

実施:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git diff --check
```

確認すること:

- `npm run typecheck` が `tsc --noEmit` として動く
- lint / build が従来どおり通る
- README の検査手順が実行可能な script だけを案内する

確認結果:

```text
npm.cmd run typecheck -> pass
npm.cmd run lint      -> pass
npm.cmd run build     -> pass
```

ブラウザ確認では `/setup` が開き、`SETUP REQUIRED` と診断 JSON 導線が表示された。

---

## 変更ファイル

- `package.json`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_64.md`

---

## 次にやること

### 1. 本物の `.env.local` で `ready` 確認

Supabase Dashboard の値を入れ、`/setup` と `/api/setup-status` の両方が `ready` になることを確認する。

### 2. 実データ画面のブラウザ確認

`/dashboard`、`/recipes`、`/settings`、`/shopping` を Supabase 接続後の実データで確認する。

### 3. レシピ画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL の収集と migration 生成へ進む。
