# PROGRESS_116

> migration docs check 追加 - 2026-05-26

## ねらい

本番 Supabase を作る時は、`supabase/migrations` の SQL を番号順に適用する。ここで README や DEPLOYMENT の一覧が古くなると、実ファイルは増えているのに本番で適用し忘れる危険がある。

migration は database 変更の線路図みたいなものだよ。線路図に駅が抜けていると、列車はそこへ止まれない。だから実ファイルと文書の一覧を自動で照合する。

## 変更内容

### Step 1: migration docs checker を追加

`scripts/check-migration-docs.mjs` を追加した。

この checker は次を確認する。

- `supabase/migrations` にある `001_...sql` 形式の実ファイルを読む
- README / DEPLOYMENT が全 migration ファイル名を含んでいる
- README / DEPLOYMENT 上の migration ファイル名が番号順に並んでいる
- 実ファイルの番号が飛んでいる場合、欠番の説明が文書に残っている
- Supabase SQL Editor の案内が残っている

現状は `001` / `002` / `004` / `005` / `006` / `007` / `008` の 7 件で、欠番 `003` の説明が必要。

### Step 2: 自己検査を追加

`scripts/check-migration-docs.test.mjs` を追加した。

一時 workspace を作り、次を確認する。

- 正しい migration 一覧なら pass
- README から実 migration ファイル名が抜けたら fail
- DEPLOYMENT の順番が入れ替わったら fail
- 欠番 `003` の説明が消えたら fail

### Step 3: 通常検査へ組み込み

`package.json` に次を追加した。

```json
"docs:migrations": "node scripts/check-migration-docs.mjs",
"docs:migrations:test": "node scripts/check-migration-docs.test.mjs"
```

`npm run check` では、Markdown 文字化け検査の後、進捗 index 検査の前に実行する。

### Step 4: 文書更新

README / DEPLOYMENT / NEXT_CHAT_HANDOFF / ROADMAP に、`docs:migrations` が通常検査に含まれることを書いた。

## 検証

```powershell
npm.cmd run docs:migrations:test
npm.cmd run docs:migrations
```

どちらも pass。

このあと標準どおり、次も通す。

```powershell
npm.cmd run check
npm.cmd run release:check
git diff --check
```

## 変更ファイル

- `scripts/check-migration-docs.mjs`
- `scripts/check-migration-docs.test.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT.md`
- `NEXT_CHAT_HANDOFF.md`
- `ROADMAP.md`
- `progress/PROGRESS_116.md`
