# NEXT CHAT HANDOFF - 完全栄養ランダム献立達人

作成日: 2026-05-25
作業場所: `D:\Codex\meal-planner`

## 最初に読むもの

1. `AGENTS.md`
2. `NEXT_CHAT_HANDOFF.md`
3. [`NEXT_IMPLEMENTATION_HANDOFF.md`](NEXT_IMPLEMENTATION_HANDOFF.md)
4. `README.md`
5. `ROADMAP.md`

## 現在地

献立アプリの表示名は、仮決まりとして「完全栄養ランダム献立達人」になっている。

タイトルは将来、画像素材へ置き換える予定。現時点ではテキスト見出しに `app-title-shadow` を当て、文字の奥に床があると仮定した「床に落ちる影」を CSS の疑似要素で表現している。これは仮デザインであり、最終ロゴではない。

## 直近で完了したこと

### 画像導入

- `supabase/recipe-images.actual.json` に 35 件分の画像 URL を整備。
- `supabase/recipe-images.sources.json` に出典メモを追加。
- `supabase/migrations/007_recipe_images.sql` を生成。
- Supabase SQL Editor で migration を適用済み。
- 検証 SQL で 35 件すべて一致、60 recipe row に expected URL が入ったことを確認済み。
- `recipe-images:sources-check` は出典メモの placeholder attribution warning に対象 recipe 名を出す。
- `recipe-images:sources-report` は warning 対象の source page URL / image URL / author / license を一覧する。
- `recipe-images:sources-report:json` は同じ情報を JSON で出す。
- `recipe-images:sources-report:markdown` は同じ情報を Markdown のチェックリストで出す。
- `recipe-images:workflow` の次アクションにも `recipe-images:sources-report` が出る。
- `recipe-images:workflow` は source note warnings と placeholder attribution warnings の件数も表示する。
- PROGRESS_102 で placeholder attribution 9 件の author / license を確定し、`sources-check:strict` も pass する状態にした。
- PROGRESS_102 で `/demo` の静的 fallback を追加し、JavaScript 読み込み前の本番 HTML でも公開 E2E の主要文言が見えるようにした。

### UI改善

- 「週の栄養」を「カロリーバランス」に変更。
- P/F/C 表記を「タンパク質」「脂質」「炭水化物」に変更。
- ゲージ下の矢印を「目標」だと分かる表示にした。
- ダッシュボードの献立カード右上に錠前を追加し、固定 / 解除できるようにした。
- 料理詳細の「献立に入れる」を「現在の一週間のメニュー一覧」へ置き換えた。
- 料理詳細からタップまたはドラッグで今週の献立枠を差し替え可能にした。
- 「つかんで外す」置き場を追加し、献立カードをドラッグして `未定` に戻せるようにした。
- メニュー一覧はその日を含めて約3日分表示し、続きは箱内スクロールにした。
- ドラッグ中に箱の上下端へ近づけると自動スクロールする。
- 料理詳細の栄養グラフを棒グラフから円グラフへ変更。
- 栄養の主要数字、材料の分量と `g` / `ml` を大きくした。
- 材料名の上に出ていた小分類名は非表示にした。

### アプリ名と仮タイトル

- 表示名を「超献立プランナー」から「完全栄養ランダム献立達人」に変更。
- 対象:
  - `src/app/layout.tsx`
  - `src/app/(auth)/layout.tsx`
  - `src/app/(main)/dashboard/page.tsx`
  - `src/app/demo/DemoClient.tsx`
  - `README.md`
- タイトル文字を一段大きくした。
- `src/app/globals.css` に `app-title-shadow` を追加。
- 現在の影は `::after` で複製文字を作り、床面に倒して投影する仮表現。

## 最新検証

最新状態で以下は pass 済み。

```powershell
npm.cmd run check
npm.cmd run recipe-images:sources-check
npm.cmd run recipe-images:sources-report
npm.cmd run --silent recipe-images:sources-report:json
npm.cmd run recipe-images:sources-report:markdown
npm.cmd run recipe-images:sources-check:strict
npm.cmd run release:check
```

`npm.cmd run check` の中身:

- `setup:doctor:test`
- `env:safety:test`
- `env:safety`
- `recipe-images:workflow:test`
- `e2e:public:test`
- `e2e:auth:test`
- `private-api:cache:test`
- `private-api:cache`
- `user-data:delete-guard:test`
- `user-data:delete-guard`
- `onboarding:schema:test`
- `onboarding:schema`
- `legal:disclosures:test`
- `legal:disclosures`
- `portfolio:check:test`
- `portfolio:check`
- `docs:links:test`
- `docs:links`
- `docs:mojibake:test`
- `docs:mojibake`
- `docs:migrations:test`
- `docs:migrations`
- `docs:progress-index:test`
- `docs:progress-index`
- `recipe-images:workflow`
- `typecheck`
- `lint`
- `build`

`recipe-images:sources-check` は pass する。author / license の再確認 warning が残る場合は、warning 行に対象 recipe 名が出る。現在は placeholder attribution warning 0 件。

`recipe-images:sources-report` は source page URL つきで再確認対象を一覧する。現在は placeholder attribution warning 0 件。`recipe-images:workflow` からも次アクションとして到達でき、workflow summary にも `placeholder attribution warnings: 0` と表示される。

`recipe-images:sources-report:json` は `placeholderAttributionSources` に recipe / sourcePageUrl / imageUrl / author / license を入れる。現在は placeholder がないため空配列になる。

`recipe-images:sources-report:markdown` は同じ情報を `- [ ]` のチェックリストとして出す。現在は placeholder がないため完了済み表示になる。

`recipe-images:sources-check:strict` は、その warning も error として扱う最終確認用。現在は pass する。

公開前のまとめ検査として `npm.cmd run release:check` も追加済み。通常検査、strict 画像出典メモ検査、公開導線 E2E を順番に実行する。通常検査には `env:safety:test` / `env:safety`、`e2e:auth:test`、`private-api:cache:test` / `private-api:cache`、`user-data:delete-guard:test` / `user-data:delete-guard`、`onboarding:schema:test` / `onboarding:schema`、`legal:disclosures:test` / `legal:disclosures`、`portfolio:check:test` / `portfolio:check`、`docs:links:test` / `docs:links`、`docs:mojibake:test` / `docs:mojibake`、`docs:migrations:test` / `docs:migrations`、`docs:progress-index:test` / `docs:progress-index` が含まれ、`.env.example` と deploy script の鍵まわり、認証付き E2E script の安全ガード、private API の no-store header、公開導線 E2E と認証付き E2E の no-store 確認、ユーザーデータ削除 API の確認 header、初回設定の選択肢と database 制約、生成 API と signup / setup / main layout の初回設定 route、プライバシーと利用規約の主要説明、README と `PORTFOLIO.md` のスクリーンショット参照、主要 Markdown のローカルファイルリンク、日本語文書の文字化け断片、migration 適用リスト、最新 progress note と ROADMAP の同期を確認する。env は環境変数、つまりアプリ外から渡す設定値。route は画面や API へ向かう道筋。migration は database 変更を順番に適用する SQL ファイル。strict は warning も失敗扱いにする確認で、placeholder attribution が戻った時に公開前で止める。`check` の build 結果を再利用し、E2E 前の重複 build は避ける。`e2e:public:run` はローカル検査時に `.next/BUILD_ID` を確認し、build が無ければ案内して止まる。`e2e:public:test` はこの guard と `E2E_BASE_URL` 分岐を自己検査する。`e2e:auth:test` は credential 不足、`E2E_AUTH_MODE` の誤り、local build 不足を外部 Supabase に触る前に自己検査する。`supabase/recipe-images.sources.json` がある作業環境向け。

PROGRESS_106 で `portfolio:check:test` を追加し、missing image と拡張子 / 中身 mismatch で失敗することも自己検査するようにした。

PROGRESS_107 で `docs:links` / `docs:links:test` を追加し、README / PORTFOLIO / ROADMAP / NEXT_CHAT_HANDOFF / DEPLOYMENT のローカルファイル参照切れを通常検査で拾えるようにした。

PROGRESS_108 で `docs:mojibake` / `docs:mojibake:test` を追加し、主要 Markdown と progress notes の文字化け断片を通常検査で拾えるようにした。

PROGRESS_109 で `docs:progress-index` / `docs:progress-index:test` を追加し、最新 `progress/PROGRESS_NN.md` が ROADMAP の最終更新と関連ドキュメントに反映されているかを通常検査で拾えるようにした。

PROGRESS_110 で `e2e:auth:test` に local build guard の自己検査を追加し、`.next/BUILD_ID` が無い状態では Supabase に触る前に案内つきで止まることを確認できるようにした。

PROGRESS_111 で `/api/user-data/delete` に確認 header 必須ガードを追加し、設定画面の削除 UI から同じ header を送るようにした。削除 API は破壊的なので、UI の確認テキストだけでなく server 側でも意図を確認する。PROGRESS_123 で UI の確認テキスト `削除` は残しつつ、通信 header の値は ASCII 安全な `delete-confirmed` に変更した。

PROGRESS_112 で `user-data:delete-guard` / `user-data:delete-guard:test` を追加し、削除 API の確認 header guard と設定画面の header 送信が通常検査で落ちないようにした。

PROGRESS_113 で `onboarding:schema` / `onboarding:schema:test` を追加し、初回設定の選択肢、`DbUser` 型、`008_user_onboarding.sql` の CHECK 制約がずれた時に通常検査で拾えるようにした。PROGRESS_117 で同じ検査に `/api/generate-plan` の初回設定完了 guard も追加した。PROGRESS_118 で signup 後 `/setup`、`(main)/layout` の未完了 redirect、`/setup` の未完了 / 完了分岐も同じ検査に含めた。

PROGRESS_114 で `legal:disclosures` / `legal:disclosures:test` を追加し、プライバシーポリシーの JSON export / 削除説明、利用規約の医療・アレルギー注意、legal 最終更新日を通常検査で拾えるようにした。

PROGRESS_115 で `env:safety` / `env:safety:test` を追加し、`.env.example` の仮値、`.gitignore` の env 除外、本番 deploy script が secret key / service_role key を Vercel production env へ送らないことを通常検査で拾えるようにした。

PROGRESS_116 で `docs:migrations` / `docs:migrations:test` を追加し、`supabase/migrations` の実ファイルと README / DEPLOYMENT の migration 適用リストがずれた時に通常検査で拾えるようにした。

PROGRESS_117 で `/api/generate-plan` が `onboarding_completed_at` を読み、未完了ユーザーには `428` と「初回設定を完了してから献立を生成してください」を返すようにした。初回設定を飛ばした API 直叩きで献立だけ作られないようにするため。

PROGRESS_104 で公開導線 E2E に `/demo?section=shopping` と `/demo?recipe=demo-natto-rice` を追加した。README で案内しているデモの深いリンクも、公開前検査で 200 と主要文言を確認する。PROGRESS_119 で `/login` も公開導線 E2E に追加し、fixture 自己検査が `ok /login` を確認するようにした。PROGRESS_120 で未ログイン `/dashboard` が `/login` へ redirect されることも公開導線 E2E に追加した。PROGRESS_121 で未ログイン `/api/generate-plan` が `401 Unauthorized` で止まることも公開導線 E2E に追加した。PROGRESS_122 で未ログイン `/api/user-data/export` の `401 Unauthorized` も追加した。PROGRESS_123 で確認 header 付きの未ログイン `/api/user-data/delete` も `401 Unauthorized` で止まることを公開導線 E2E に追加した。PROGRESS_124 で header なし `/api/user-data/delete` が `400` で止まることも公開導線 E2E に追加した。PROGRESS_125 で user-data API の `400` / `401` に `Cache-Control: no-store` が付くことも公開導線 E2E に追加した。PROGRESS_126 で `/api/generate-plan` の `401` も no-store 確認対象に追加した。PROGRESS_127 で `/api/assign-recipe` と `/api/weekly-locks/[id]` の PATCH / DELETE も未ログイン `401` と no-store 確認対象に追加し、初回設定未完了時の mutation API guard も `onboarding:schema` に含めた。PROGRESS_128 で公開導線 E2E の API ログに HTTP method を出し、weekly-locks の PATCH / DELETE が別々に読めるようにした。PROGRESS_129 で `private-api:cache` / `private-api:cache:test` を追加し、private API の no-store header と公開導線 E2E の header 確認が外れた時に通常検査で拾えるようにした。PROGRESS_130 で `e2e:public:test` に private API の no-store header 欠落 negative case を追加し、runtime-style self-test でも header check の効き目を確認するようにした。PROGRESS_131 で `private-api:cache` に認証付き E2E の assign-recipe / user-data export no-store 確認も含め、auth E2E 側の header check が外れた時も通常検査で拾えるようにした。PROGRESS_132 で認証付き E2E の成功系 `POST /api/generate-plan` も no-store 確認対象に追加し、`private-api:cache` の auth E2E guard に含めた。

PROGRESS_102 では `release:check` が pass し、dev server 上の `http://localhost:3000/setup` も Browser で表示確認済み。title は `完全栄養ランダム献立達人`、`Supabase` と `画像クレジット` の文言も取得できた。

ブラウザ確認済み:

- ダッシュボードで新タイトル表示
- タイトルの床落ち影
- カロリーバランス表示
- 錠前の固定 / 解除
- 料理詳細の一週間メニュー一覧
- タップで献立差し替え
- ドラッグで献立から外す
- 円グラフ表示
- 材料欄の分量拡大

## 確認画像

ワークスペースに以下の確認画像がある。

- `app-title-shadow-floor-verify.png`
- `recipe-menu-lock-remove-verify.png`
- `recipe-menu-three-days-verify.png`
- `recipe-nutrition-ingredient-large-verify.png`
- `recipe-nutrition-readable-verify.png`
- `recipe-assign-scroll-verify.png`
- `recipe-detail-ui-verify.png`
- `dashboard-ui-verify.png`

## 重要ファイル

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/app/(main)/dashboard/WeekCalendar.tsx`
- `src/components/meal-card/MealCard.tsx`
- `src/components/nutrition-chart/NutritionChart.tsx`
- `src/app/(main)/recipes/[id]/page.tsx`
- `src/app/(main)/recipes/[id]/RecipeDetailClient.tsx`
- `src/app/(main)/recipes/[id]/RecipeAssignPanel.tsx`
- `src/app/demo/DemoClient.tsx`
- `src/app/api/assign-recipe/route.ts`
- `src/lib/week-plan.ts`
- `supabase/migrations/007_recipe_images.sql`

## Git状態の注意

`D:\Codex\meal-planner` 本体は、PROGRESS_91 の source notes warning 表示変更が未コミット。作業前は clean だった。

重要:

- ユーザーが明示しない限り、meal-planner 本体を commit / push しない。
- 既存の未コミット変更を revert しない。
- `.env.local` の Supabase 情報を会話やノートに書かない。
- Obsidian vault への記録は別リポジトリで行う。

## Obsidian記録

直近の Obsidian vault 追加:

- `D:\Obsidian\ShikiVault\Projects\献立プランナー\2026-05-25_完全栄養ランダム献立達人_UI改善と画像導入.md`
- commit: `736687c Add meal planner UI context note`
- push 済み

この handoff の後続として、今回の「仮タイトル確定」と `NEXT_CHAT_HANDOFF.md` 作成も Obsidian vault に保存する。

## 次にやるなら

実用化の大きな次タスクは、[`NEXT_IMPLEMENTATION_HANDOFF.md`](NEXT_IMPLEMENTATION_HANDOFF.md) にまとめた。内容は「本番データでの実運用確認」「認証後 E2E」「初回ユーザー導線」「レシピ品質と量」「献立生成の納得感」「エラー・空状態・読み込み状態」「スマホでの実使用感」「データ削除・エクスポート」の 8 項目。

1. タイトルを画像素材に置き換える時は、`app-title-shadow` を削るか、画像用の別スタイルへ移行する。
2. 公開前は `npm.cmd run release:check` を通す。
3. 画像出典を追加・変更した場合は、`recipe-images:sources-check:strict` まで通す。
4. 料理詳細の「つかんで入れる」「つかんで外す」の言葉を、必要ならさらに柔らかくする。
5. 調理工程写真を入れる場合は、まず利用可能な実画像を探し、出典・作者・ライセンスを控える。
6. 使える工程写真がない場合は、生成画像で統一感を出す。
7. 本体コミットを作る場合は、画像 workflow、UI改善、タイトル仮デザインを分けて整理する。

## 公開準備メモ

- `/legal`、`/legal/terms`、`/legal/privacy`、`/legal/attributions` を追加済み。
- signup に利用規約とプライバシーポリシー確認 checkbox を追加済み。
- `/login` と `/signup` は公開導線 E2E で確認済み。
- 未ログイン `/dashboard` が `/login` へ redirect されることも公開導線 E2E で確認済み。
- 未ログイン `/api/generate-plan` が `401 Unauthorized` で止まることも公開導線 E2E で確認済み。
- 未ログイン `/api/assign-recipe` が `401 Unauthorized` で止まることも公開導線 E2E で確認済み。
- 未ログイン `/api/weekly-locks/[id]` の PATCH / DELETE が `401 Unauthorized` で止まることも公開導線 E2E で確認済み。
- 未ログイン `/api/user-data/export` が `401 Unauthorized` で止まることも公開導線 E2E で確認済み。
- 未ログイン `/api/user-data/delete` が確認 header 付きでも `401 Unauthorized` で止まることも公開導線 E2E で確認済み。
- `/api/user-data/delete` は確認 header が無い場合 `400` で止まることも公開導線 E2E で確認済み。
- generate-plan、assign-recipe、weekly-locks、user-data 系 API の `400` / `401` に `Cache-Control: no-store` が付くことも公開導線 E2E で確認済み。
- `npm run e2e:public` で build 付きの公開前主要導線を確認可能。
- `npm run e2e:public:run` で build 済み状態の公開前主要導線だけを確認可能。
- `npm run e2e:public:test` で E2E script の build guard を軽く自己検査可能。
- `DEPLOYMENT.md` に本番 Supabase、Vercel、公開後確認の手順を追加済み。
- 2026-05-25 時点では `SUPABASE_ACCESS_TOKEN` と Vercel credential が無く、本番 project 作成と deploy 実行は停止。
