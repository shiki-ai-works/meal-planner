# PROGRESS_117

> generate-plan onboarding guard 追加 - 2026-05-26

## ねらい

初回設定画面とメイン画面の redirect は整ってきた。ただ、画面の導線が正しくても、`/api/generate-plan` を直接叩けば、初回設定が終わる前に献立生成だけ走る余地があった。

画面の玄関に案内係がいても、裏口が開いていたら家の流れは崩れる。今回は API 側にも初回設定完了の確認を入れた。

## 変更内容

### Step 1: `/api/generate-plan` に初回設定完了 guard を追加

`src/app/api/generate-plan/route.ts` で `isUserOnboarded()` を使うようにした。

ユーザー取得時の select に `onboarding_completed_at` を追加し、値が無い場合は次を返す。

```ts
{ error: '初回設定を完了してから献立を生成してください' }
```

HTTP status は `428`。428 は precondition required、つまり「先に満たすべき条件があります」という意味の状態コード。

初回設定フォームは先に `users` を upsert して `onboarding_completed_at` を入れてから `/api/generate-plan` を呼ぶため、通常の初回導線はそのまま通る。

### Step 2: onboarding schema checker を拡張

`scripts/check-onboarding-schema.mjs` で `src/app/api/generate-plan/route.ts` も見るようにした。

確認する内容:

- `isUserOnboarded` を使っている
- `onboarding_completed_at` を select している
- 未完了時の説明文がある
- `status: 428` で止めている

### Step 3: 自己検査を追加

`scripts/check-onboarding-schema.test.mjs` に、generate-plan route から guard が消えた時に fail するケースを追加した。

## 検証

```powershell
npm.cmd run onboarding:schema:test
npm.cmd run onboarding:schema
```

どちらも pass。

このあと標準どおり、次も通す。

```powershell
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 変更ファイル

- `src/app/api/generate-plan/route.ts`
- `scripts/check-onboarding-schema.mjs`
- `scripts/check-onboarding-schema.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_117.md`
