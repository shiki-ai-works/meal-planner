# 献立プランナー 開発進捗 #60

> **setup 画面の request-time rendering** — 2026-05-25

PROGRESS_59 で `/api/setup-status` を追加し、Supabase env の状態を JSON で見られるようにした。今回は `/setup` 画面そのものも、build 時ではなく request 時に env を読むようにした。鍵の有無は天気のように変わるものだから、昨日の空を今日の窓に貼ってはいけない。

---

## 何をやったか

### Step 1: Next.js 16 の作法確認

参照:

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/index.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`

Next.js 16 では、単に `process.env` を読むだけだと `/setup` が静的に prerender される可能性がある。`connection()` は「実際の request が来るまで描画を進めない」と伝える関数なので、env 判定のような runtime 情報に合っている。

### Step 2: `/setup` を request 時描画へ変更

変更:

- `src/app/setup/page.tsx`

追加:

```ts
import { connection } from 'next/server'

export default async function SetupPage() {
  await connection()
  // Supabase env 判定はここから下で読む
}
```

これで `/setup` は build 時の env に固定されず、開いた時点の env 判定を使う。

---

## 検証

実施:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

ブラウザ / API 確認:

```text
http://localhost:3000/setup
http://localhost:3000/api/setup-status
```

確認すること:

- `/setup` が `SETUP REQUIRED` と診断 JSON 導線を表示する
- `/api/setup-status` が同じく `required` を返す
- `next build` の route 一覧で `/setup` が dynamic route として表示される
- build / lint / typecheck が通る

確認結果:

```text
├ ƒ /setup
```

ブラウザ確認では `/setup` に `SETUP REQUIRED`、`/demo` 導線、`/api/setup-status` 導線が表示された。`/api/setup-status` は `status: "required"` を返した。

---

## 変更ファイル

- `src/app/setup/page.tsx`
- `ROADMAP.md`
- `progress/PROGRESS_60.md`

---

## 次にやること

### 1. 本物の `.env.local` で `ready` 確認

Supabase Dashboard の値を入れ、`/setup` と `/api/setup-status` の両方が `ready` になることを確認する。

### 2. 実データ画面のブラウザ確認

`/dashboard`、`/recipes`、`/settings`、`/shopping` を Supabase 接続後の実データで確認する。

### 3. レシピ画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL の収集と migration 生成へ進む。
