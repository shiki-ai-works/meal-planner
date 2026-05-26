# PROGRESS_113

> **onboarding schema check** - 2026-05-26

初回設定では、自炊頻度や献立の目的を選ぶ。ここは UI、TypeScript 型、database の CHECK 制約が同じ言葉を見ていないと、画面では選べるのに保存で落ちることがある。今回はそのずれを通常検査で拾えるようにした。

## やったこと

### Step 1: onboarding schema checker を追加

`scripts/check-onboarding-schema.mjs` を追加した。
この script は次を確認する。

- `SelfCookFrequency` の union と `self_cook_frequency` の CHECK 制約が同じ値を持つ
- `PlanningGoal` の union と `planning_goal` の CHECK 制約が同じ値を持つ
- migration 008 の default が UI 側の fallback と合っている
- `onboarding_completed_at` が migration と `DbUser` にある
- `DbUser` の union が onboarding 側の union と合っている

schema は database の形のこと。CHECK 制約は、database が受け取れる値の決まりだよ。

### Step 2: 自己検査を追加

`scripts/check-onboarding-schema.test.mjs` を追加した。
一時フォルダに小さな onboarding / types / migration を作り、次のケースを確認する。

- 正しい schema は pass
- migration の選択肢が足りない場合は fail
- `DbUser` の union がずれている場合は fail

### Step 3: 通常検査へ組み込み

`onboarding:schema` と `onboarding:schema:test` を `package.json` に追加し、`npm run check` に組み込んだ。
README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も更新した。

## 確認したこと

- `npm.cmd run onboarding:schema:test` -> pass
- `npm.cmd run onboarding:schema` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass

## 変更ファイル

- `scripts/check-onboarding-schema.mjs`
- `scripts/check-onboarding-schema.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_113.md`
