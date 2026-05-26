# NEXT CHAT HANDOFF

作成日: 2026-05-26
作業場所: `D:\Codex\meal-planner`

## 最初に読むもの

1. `AGENTS.md`
2. `NEXT_CHAT_HANDOFF.md`
3. `NEXT_IMPLEMENTATION_HANDOFF.md`
4. `README.md`
5. `ROADMAP.md`

## 現在の状態

- ブランチ: `main`
- リモート: `origin https://github.com/shiki-ai-works/meal-planner.git`
- 最新 commit: `f06b63c Add productization safeguards and onboarding flow`
- この commit は `origin/main` に push 済み。
- push 後の確認では作業ツリーは clean だった。
- Obsidian vault は今回触っていない。ユーザーが別途頼んだときだけ扱う。

## このセッションで決めたこと

### 1. 製品化に必要なものは能動的に提案する

ユーザーは実務経験がない前提で進める。今後は、製品化に必要そうなものを見つけた時点でこちらから提案する。

- 専門用語や IT 用語は、出したタイミングで短く説明する。
- 提案は「必須」「重要」「後で」「注意」のように優先度を分ける。
- 口だけの助言で終わらせず、必要ならテンプレート、チェックリスト、README、バックログ、ログ、運用ルールなどの具体物に落とす。
- ユーザーを product owner、つまり製品の方向を決める人として扱う。ただし業界知識を知っている前提にはしない。

この方針は `AGENTS.md` の `Productization guidance` に保存済み。

### 2. 判断ログは残す。ただし生ログではなく判断記録にする

添付されていた `decision-review-log_README.md` の目的に対して、ログは残した方がよいと判断した。

ただし全部を監視カメラのように記録するのではなく、あとで判断をたどれる足跡として残す。

残すとよい項目:

- 検討日
- 対象サービス、教材、契約、製品など
- 公式 URL
- 価格、契約期間、解約条件
- 解決したい目的
- 期待できる価値
- 不安、リスク
- 代替案
- 結論: 購入、見送り、保留、追加調査
- 理由
- 確信度
- 次の行動
- 見直し日
- 根拠 URL と確認日

残さない方がよいもの:

- パスワード
- API key、つまり外部サービスを操作できる秘密の鍵
- token、つまりログイン権限などを表す秘密文字列
- カード番号
- 住所や電話番号
- アカウント ID
- 機密契約情報
- 個人的すぎるチャット全文

### 3. `#nextchat` の動作を作る

ユーザーが `#nextchat` を含めたら、次のチャットに持ち越すための引き継ぎを作る。

標準動作:

- `NEXT_CHAT_HANDOFF.md` を更新する。
- 今のプロジェクト状態、決めたこと、実装したこと、検証結果、残課題、次にやるとよいことを書く。
- 秘密情報や `.env.local` の値は書かない。
- GitHub へ commit / push は、ユーザーが `#obsidiangit` も付けるか、明示的に頼んだときだけ行う。
- Obsidian vault への保存は、ユーザーが明示的に頼んだときだけ行う。

この方針は `AGENTS.md` の `#nextchat workflow` に保存済み。

### 4. `#obsidiangit` の扱い

ユーザーが `obsidiangit` と言ったので、プロジェクト本体を commit して GitHub に push した。

実行したこと:

- `git status --short --branch` で状態確認
- `git remote -v` で push 先確認
- `git diff --stat` で差分規模確認
- 秘密情報っぽい文字列の簡易検索
- `git diff --check`
- `npm.cmd run release:check`
- `git add -- .`
- `git commit -m "Add productization safeguards and onboarding flow"`
- `git push origin main`

## 実装済みの主な内容

詳細は `NEXT_IMPLEMENTATION_HANDOFF.md` と progress notes を読む。

大枠:

- 初回オンボーディング画面と関連 schema
- user data export / delete API
- delete API の確認 header guard
- private API の `Cache-Control: no-store` guard
- public E2E、auth E2E、各種自己テスト
- 法務表示、privacy、terms まわりの確認
- deployment、README、ROADMAP の整備
- progress notes `PROGRESS_110` から `PROGRESS_132`
- 製品化ガイダンスを `AGENTS.md` に追記

用語メモ:

- API: アプリ同士が情報をやりとりする入口。
- E2E: End to End test。実際の利用に近い流れで画面や API を確認するテスト。
- schema: データの形や制約。
- guard: 危ない操作や想定外の操作を止める門番。
- cache: 一度取得した結果を一時保存する仕組み。
- no-store: ブラウザや中間サーバーに保存させない指定。
- migration: データベースの構造変更を適用するための SQL ファイル。

## 検証結果

直近で成功した検証:

```powershell
git diff --check
npm.cmd run release:check
```

`npm.cmd run release:check` には、型チェック、Lint、ビルド、ドキュメント検査、画像出典チェック、公開 E2E が含まれる。

公開 E2E では以下も確認済み:

- `/setup`
- `/demo`
- `/legal`
- `/legal/terms`
- `/legal/privacy`
- `/legal/attributions`
- `/login`
- `/signup`
- 未ログイン `/dashboard` が `/login` へ redirect
- 未ログイン private API が `401`
- user-data delete の確認 header なしが `400`
- private API のレスポンスに `Cache-Control: no-store`

## 残っていること

### 必須に近い

- 本番データでの実利用確認。
- 認証つき E2E の実行。`E2E_AUTH_EMAIL` と `E2E_AUTH_PASSWORD` が必要。
- Supabase migration の本番適用状況の再確認。

### 重要

- 製品化バックログを作る。例: `PRODUCTIZATION_BACKLOG.md`
- 判断ログテンプレートを実ファイル化する。
- privacy / delete / export のユーザー向け説明をさらに読みやすくする。
- 初回オンボーディング後の体験を実ユーザー目線で確認する。

### 後で

- decision-review-log のような判断記録機能を、この meal planner の運用にも応用するか検討する。
- スクリーンショットつきリリースノートを整備する。
- GitHub Issues か Markdown backlog に、未実装項目を小さく分解する。

## 次のチャットへの指示

まず `AGENTS.md` とこのファイルを読む。

ユーザーが何も指定せず続きを頼んだ場合は、次の順で進めるとよい。

1. `git status --short --branch` を確認する。
2. `NEXT_IMPLEMENTATION_HANDOFF.md` と `ROADMAP.md` を読む。
3. 直近の残課題から、製品化に効くものを優先して提案または実装する。
4. 専門用語は短く説明する。
5. 変更したら必要な検証を走らせる。

`#nextchat` が来たら、このファイルを更新する。
`#obsidiangit` が来たら、状態確認、検証、commit、push まで行う。
