# 献立プランナー 開発進捗 #59

> **setup status API と API 導線整理** — 2026-05-25

PROGRESS_58 で Supabase env 判定を一つの物差しに寄せた。今回は、その物差しを外から覗ける小さな診断窓口として `/api/setup-status` を追加した。鍵そのものは見せず、何が足りないかだけを返す。灯台は海図を渡すが、宝箱の鍵は渡さない、という具合だ。

---

## 何をやったか

### Step 1: setup status API を追加

追加:

- `src/app/api/setup-status/route.ts`

返す内容:

```json
{
  "ok": false,
  "status": "required",
  "issues": [
    {
      "key": "NEXT_PUBLIC_SUPABASE_URL",
      "message": "Project URL が未設定です。"
    }
  ],
  "setupPath": "/setup"
}
```

`status` は次の 3 段階:

- `required`: 未入力の値がある
- `check`: 値はあるが仮値または不正形式
- `ready`: 必要な値が揃っている

### Step 2: middleware の API 扱いを整理

変更:

- `src/lib/supabase/middleware.ts`

Supabase 未設定時でも `/api/setup-status` は通すようにした。通常の `/api/...` は引き続き 503 JSON を返す。

また Supabase 設定済みの通常 API は、middleware でログイン画面へ redirect せず、各 route handler 側の `Unauthorized` などの JSON 応答に任せるようにした。API は画面ではなく通信の約束なので、HTML の入口へ曲げるより JSON で答える方が自然だ。

### Step 3: setup / README / ROADMAP の導線更新

変更:

- `src/app/setup/page.tsx`
- `README.md`
- `ROADMAP.md`

`/setup` から診断 JSON を開けるリンクを追加し、README にも `/api/setup-status` を記載した。

---

## 検証

実施済み:

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
http://localhost:3000/api/generate-plan
```

確認すること:

- Supabase 未設定でも `/api/setup-status` は 200 JSON を返す
- Supabase 未設定時の通常 API は 503 JSON を返す
- `/setup` に診断 JSON への導線が表示される
- build / lint / typecheck が通る

確認結果:

```json
{
  "ok": false,
  "status": "required",
  "setupPath": "/setup"
}
```

---

## 変更ファイル

- `src/app/api/setup-status/route.ts`
- `src/app/setup/page.tsx`
- `src/lib/supabase/middleware.ts`
- `README.md`
- `ROADMAP.md`
- `progress/PROGRESS_59.md`

---

## 次にやること

### 1. 本物の `.env.local` でログイン確認

Supabase Dashboard の値を入れた状態で `/api/setup-status` が `ready` を返し、`/login` から進めることを確認する。

### 2. 実データ画面のブラウザ確認

`/dashboard`、`/recipes`、`/settings`、`/shopping` を実データで開き、API 応答と UI の噛み合わせを見る。

### 3. レシピ画像 URL 投入へ戻る

`recipe-images:actual-workflow` を起点に、実 URL の収集と migration 生成へ進む。
