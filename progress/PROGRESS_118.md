# PROGRESS_118

> onboarding route guard check 追加 - 2026-05-26

## ねらい

初回設定の保存先と API 側の guard は整ってきた。次に大事なのは、ユーザーが画面を進む時の道筋そのものが、あとから崩れないようにすること。

route は画面や API へ向かう道筋のことだよ。道標が一つずれるだけで、初回ユーザーは `/dashboard` と `/setup` の間で迷いやすくなる。今回は `onboarding:schema` に初回設定 route の静的確認を足した。

## 変更内容

### Step 1: signup 後の導線を確認

`scripts/check-onboarding-schema.mjs` が `src/app/(auth)/signup/page.tsx` を読み、アカウント作成後に `router.push('/setup')` しているか確認するようにした。

### Step 2: メインレイアウトの未完了 redirect を確認

`src/app/(main)/layout.tsx` について、次を確認する。

- `isUserOnboarded` を使っている
- `onboarding_completed_at` を select している
- 初回設定未完了なら `redirect('/setup')` する

これで、認証後の保護ページへ直接入った時も、初回設定を飛ばせないことを通常検査で拾える。

### Step 3: `/setup` の分岐を確認

`src/app/setup/page.tsx` について、次を確認する。

- 未完了ユーザーには `OnboardingClient` を返す
- `!isUserOnboarded(dbUser)` で分岐する
- 完了済みユーザーは `redirect('/dashboard')` する

### Step 4: 自己検査を追加

`scripts/check-onboarding-schema.test.mjs` に route guard の fixture を追加した。

あわせて、signup が `/dashboard` に変わった時、main layout が `onboarding_completed_at` を読まなくなった時に fail するケースも追加した。

## 検証

```powershell
npm.cmd run onboarding:schema:test
npm.cmd run onboarding:schema
npm.cmd run docs:progress-index
npm.cmd run docs:links
```

どれも pass。

このあと標準どおり、次も通す。

```powershell
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 変更ファイル

- `scripts/check-onboarding-schema.mjs`
- `scripts/check-onboarding-schema.test.mjs`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_118.md`
