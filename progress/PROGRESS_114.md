# PROGRESS_114

> **legal disclosure check** - 2026-05-26

ユーザーデータの export / delete が入ったので、プライバシーポリシーにもその説明が残っていることを通常検査で見張るようにした。法務文書は地味だけど、利用者にとっては「何が起きるか」を知るための灯りだからね。

## やったこと

### Step 1: legal disclosure checker を追加

`scripts/check-legal-disclosures.mjs` を追加した。
この script は次を確認する。

- `LEGAL_LAST_UPDATED` が 2026-05-26 以降
- legal index に terms / privacy / attributions への link がある
- privacy に JSON export の説明がある
- privacy にアプリ内保存データ削除の説明がある
- privacy に削除対象のカテゴリが書かれている
- privacy に認証アカウント削除は別扱いだと書かれている
- privacy に Supabase 利用が書かれている
- terms に医療・栄養指導・診断の代わりではない説明がある
- terms にアレルギーや健康状態の安全確認がある
- terms に禁止事項がある

### Step 2: 自己検査を追加

`scripts/check-legal-disclosures.test.mjs` を追加した。
一時フォルダに小さな legal / privacy / terms を作り、次のケースを確認する。

- 正しい disclosure は pass
- `LEGAL_LAST_UPDATED` が古い場合は fail
- privacy から削除説明が抜けた場合は fail

### Step 3: 通常検査へ組み込み

`legal:disclosures` と `legal:disclosures:test` を `package.json` に追加し、`npm run check` に組み込んだ。
`LEGAL_LAST_UPDATED` も `2026-05-26` へ更新した。
README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP も更新した。

## 確認したこと

- `npm.cmd run legal:disclosures:test` -> pass
- `npm.cmd run legal:disclosures` -> pass
- `npm.cmd run check` -> pass
- `npm.cmd run release:check` -> pass
- `git diff --check` -> pass

## 変更ファイル

- `scripts/check-legal-disclosures.mjs`
- `scripts/check-legal-disclosures.test.mjs`
- `src/lib/legal.ts`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_114.md`
