# 完全栄養ランダム献立達人

パステル + HUD アクセントの週間献立アプリです。献立生成、レシピ図鑑、在庫、買い物リスト、毎週固定の管理をひとつの画面群にまとめます。HUD は、必要な情報を画面上に重ねて見せるゲーム風の情報表示のことです。

## ポートフォリオ概要

「毎週の献立を考える」「家にある食材を使い切る」「買い物リストへ落とし込む」という日常の負担を、Next.js と Supabase でまとめて扱う Web アプリです。Next.js は画面とサーバー処理を同じプロジェクトで作れる React framework、Supabase は認証と database（データベース）をまとめて扱うクラウド基盤です。

主な利用者は、忙しい一人暮らし・共働き・家族の食事管理をする人です。献立をランダムに組むだけでなく、固定したい食事、外食枠、在庫、常備品、栄養バランス、画像出典まで扱えるようにしています。

採用・案件提案向けの詳しい case study は [`PORTFOLIO.md`](PORTFOLIO.md) にまとめています。case study は、作品の背景、設計、技術的な見どころを説明する資料です。

### 何を作ったか

- 7日分の朝・昼・夜を自動生成する献立 dashboard
- 在庫と常備品を差し引いて作る買い物リスト
- レシピ詳細、材料、手順、PFC バランス表示
- Supabase Auth を使うログイン・新規登録導線
- 公開用の利用規約、プライバシーポリシー、画像クレジット
- 公開前 E2E と出典チェックを含む release 前検査

### 技術構成

| 領域 | 使用技術 |
|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handler, Supabase Auth, Supabase Database |
| State / Logic | Zustand, 独自の献立生成・栄養計算・買い物リスト集計 |
| Quality | ESLint, TypeScript, `npm run check`, 公開導線 E2E |
| Operations | Supabase migration, Vercel deploy helper, 画像出典 source notes |

Route Handler は Next.js の API 実装場所です。migration は database の変更履歴を SQL として順番に適用する仕組みです。E2E は end-to-end の略で、入口から出口までの動作をまとめて確認する検査です。

## スクリーンショット

### Dashboard / 献立生成

![Dashboard preview](public/portfolio/demo-dashboard.jpg)

![Weekly meal plan preview](public/portfolio/demo-week-plan.jpg)

### 買い物リスト

![Shopping list preview](public/portfolio/demo-shopping-list.jpg)

### レシピ詳細

![Recipe detail preview](public/portfolio/demo-recipe-detail.jpg)

### 公開情報・法務ページ

![Legal overview preview](public/portfolio/legal-overview.jpg)

## 技術的な見どころ

- **認証付きページ制御**: Supabase session を見て、未ログイン時は auth 画面へ誘導します。
- **初回 setup 導線**: 人数、苦手食材、アレルギー、自炊頻度、目標を保存し、最初の献立生成へつなげます。
- **献立生成ロジック**: ペルソナ、固定枠、外食枠、在庫、苦手・アレルギー情報、目標を踏まえて週次プランと短い理由を作ります。
- **買い物リスト集計**: 週の献立、在庫、常備品をもとに、買うべき食材だけを category 別にまとめます。
- **ユーザーデータ管理**: 設定、献立、在庫、買い物履歴を JSON で export し、アプリ内データを削除できます。削除 API は確認テキストに加えて確認 header も要求します。header は request に添える小さな目印です。
- **Supabase migration**: 初期 schema、seed recipe、詳細レシピ、画像 URL を migration として管理します。
- **公開導線 E2E**: `/setup`、`/demo`、デモの深いリンク、`/legal`、`/login`、`/signup`、未ログイン `/dashboard` の `/login` redirect、未ログイン `/api/generate-plan`、`/api/assign-recipe`、`/api/weekly-locks/[id]`、`/api/user-data/export`、`/api/user-data/delete` の `401`、削除 API の確認 header 不足 `400`、private API の `Cache-Control: no-store` など、公開前に必要な導線をまとめて確認します。
- **画像出典チェック**: 画像 URL と source notes（出典メモ）の整合性を検査し、author / license の再確認対象も出せます。
- **本番 deploy helper**: Vercel CLI の日本語 hostname 問題を避けながら、本番 deploy と公開後 E2E をまとめて実行できます。

## デモ導線

Supabase の値がまだ無い場合でも、`http://localhost:3000/demo` で主要 UI を確認できます。

- `/demo`: 献立生成 dashboard
- `/demo?section=shopping`: 買い物リストを直接表示
- `/demo?recipe=demo-natto-rice`: レシピ詳細 modal を直接表示
- `/legal`: 利用規約・プライバシー・画像クレジットの入口

## 起動

```powershell
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。Windows で裏側に起動したい場合は、次も使えます。

```powershell
scripts\start-dev.cmd
```

Supabase の値がまだ無い場合でも、`http://localhost:3000/demo` でデモ画面を確認できます。
また、`http://localhost:3000/setup` では不足している環境変数と鍵の取り方を確認できます。
診断用の `http://localhost:3000/api/setup-status` は、接続状態を JSON（機械が読みやすい形式）で返します。

## Supabase 設定

このアプリは Supabase を使います。Supabase は、認証とデータベースをまとめて扱うクラウド基盤です。

まず `.env.example` を `.env.local` に写し、実際の値へ置き換えてください。

```powershell
Copy-Item .env.example .env.local
```

最低限必要な値:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase の鍵を探す場所

Supabase Dashboard で対象プロジェクトを開き、Connect ダイアログ、または `Settings > API Keys` から値を確認します。

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable key、または legacy anon key

参考:

- Supabase Dashboard: https://supabase.com/dashboard/projects
- API keys 公式説明: https://supabase.com/docs/guides/getting-started/api-keys

`NEXT_PUBLIC_` で始まる値はブラウザへ公開されます。secret key や service_role key は、`NEXT_PUBLIC_SUPABASE_ANON_KEY` に入れないでください。

`SUPABASE_SERVICE_ROLE_KEY` は管理用の強い鍵です。通常の画面起動には不要ですが、データ投入や運用スクリプトで使う可能性があります。公開リポジトリへは絶対に入れないでください。

`.env.local` を作ったら、開発サーバーを再起動します。

`.env.example` の仮値のままでは接続済み扱いになりません。`/setup` では未設定、仮値、URL 形式の誤りを分けて表示します。
同じ判定は `/api/setup-status` でも確認できます。鍵そのものは返さず、状態と修正すべき項目だけを返します。

ブラウザを開く前に手元で診断したい場合は、次を使います。doctor は診断係という意味で、鍵そのものは表示しません。

```powershell
npm run setup:doctor
```

同じ案内は `http://localhost:3000/setup` の `.env.local` セクションにも表示されます。

検査に失敗したらコマンド自体も失敗させたい場合は、strict（厳格）版を使います。

```powershell
npm run setup:doctor:strict
```

自動化や記録に使う場合は、JSON 形式でも出せます。JSON は機械が読みやすい構造化データです。

```powershell
npm run --silent setup:doctor:json
```

JSON には `diagnosticSchemaVersion` が入ります。これは診断 JSON の形の版番号です。

診断コマンドの指定を確認したい場合:

```powershell
npm run setup:doctor:help
```

診断 script の自己検査を走らせる場合:

```powershell
npm run setup:doctor:test
```

## データベース

Supabase SQL Editor で `supabase/migrations` を番号順に適用します。

```text
001_initial_schema.sql
002_seed_recipes.sql
004_user_targets.sql
005_detailed_recipes.sql
006_detailed_existing_recipes.sql
007_recipe_images.sql
008_user_onboarding.sql
```

`003` は過去に別途適用済みとして扱われています。新しい環境で必要になった場合は、`meal_plans` の `user_id, week_start_date` unique 制約を確認してください。

## 検査

まとめて確認する場合:

```powershell
npm run check
```

`check` は setup doctor の自己検査、env safety 検査、画像 URL workflow の自己検査、公開導線 E2E の自己検査、認証付き E2E script の自己検査、private API cache guard 検査、ユーザーデータ削除 guard 検査、onboarding schema 検査、legal disclosure 検査、ポートフォリオ画像参照検査、Markdown ローカルリンク検査、Markdown 文字化け検査、migration docs 検査、進捗 index 検査、画像 URL workflow 診断、型検査、lint、build を順番に実行します。env は環境変数、つまりアプリの外から渡す設定値です。env safety 検査は、`.env.example` が仮値のままか、`.env*` が Git から除外されているか、本番 deploy script が secret key や service_role key を Vercel に送らないかを確認します。lint はコードの書き方の検査、build は本番用に組み立てられるかの検査です。private API cache guard 検査は、個人向け API の JSON 応答が `Cache-Control: no-store` を持ち、公開導線 E2E でもその header を確認しているかを見ます。cache は一度見た応答を保存して再利用する仕組みで、`no-store` は保存しないでという指定です。ユーザーデータ削除 guard 検査は、削除 API が確認 header を server 側で要求し、設定画面の削除 UI が同じ header を ASCII 安全な値で送るか確認します。ASCII は通信 header に安全に乗せやすい英数字中心の文字の範囲です。onboarding schema 検査は、初回設定の選択肢と database の CHECK 制約、`/api/generate-plan`、`/api/assign-recipe`、`/api/weekly-locks/[id]` が初回設定完了前の生成・変更を止めるか、signup / setup / main layout の初回設定ルートが崩れていないかを確認します。schema は database の形、CHECK 制約は database が受け取れる値の決まりです。route は画面や API へ向かう道筋です。legal disclosure 検査は、プライバシーポリシーに JSON export と削除、利用規約に医療・アレルギー注意が残っているか確認します。ポートフォリオ画像参照検査は、README と case study から参照しているスクリーンショットが存在し、拡張子どおりの JPEG / PNG として読めるかを確認します。Markdown ローカルリンク検査は、README や ROADMAP などの文書内リンクが実在するファイルを指しているか確認します。Markdown 文字化け検査は、日本語文書に UTF-8 の読み違えで生まれやすい断片が混ざっていないか確認します。migration docs 検査は、`supabase/migrations` の実ファイルが README / DEPLOYMENT の適用順リストに載っているか確認します。進捗 index 検査は、最新の `progress/PROGRESS_NN.md` が ROADMAP の最終更新と関連ドキュメントに反映されているか確認します。画像 URL workflow 診断は、actual manifest がまだ無い場合でも次の手順を表示して通ります。

公開前にまとめて確認する場合は、次を使います。release は公開候補という意味です。このコマンドは通常検査、strict 画像出典メモ検査、公開導線 E2E を順番に実行します。strict は「警告も失敗として扱う」強めの確認です。`check` の build 結果を E2E で再利用するため、同じ build を二度走らせません。`supabase/recipe-images.sources.json` がある作業環境向けです。

```powershell
npm run release:check
```

個別に確認する場合:

```powershell
npm run setup:doctor:test
npm run env:safety:test
npm run env:safety
npm run recipe-images:workflow:test
npm run e2e:public:test
npm run e2e:auth:test
npm run user-data:delete-guard:test
npm run user-data:delete-guard
npm run onboarding:schema:test
npm run onboarding:schema
npm run legal:disclosures:test
npm run legal:disclosures
npm run portfolio:check:test
npm run portfolio:check
npm run docs:links:test
npm run docs:links
npm run docs:mojibake:test
npm run docs:mojibake
npm run docs:migrations:test
npm run docs:migrations
npm run docs:progress-index:test
npm run docs:progress-index
npm run recipe-images:workflow
npm run recipe-images:sources-check
npm run recipe-images:sources-check:strict
npm run recipe-images:sources-report
npm run typecheck
npm run lint
npm run build
git diff --check
```

公開前のユーザー導線を確認する場合は、次も使えます。E2E は end-to-end の略で、画面に近い入口から出口までをまとめて確認する検査です。

```powershell
npm run e2e:public
```

既に起動済みのサーバーを相手にする場合は、`E2E_BASE_URL` に URL を入れてから `node scripts/e2e-public-flow.mjs` を実行します。

build 済みの状態で E2E だけを走らせる場合は、次の短縮コマンドも使えます。ローカルの `next start` を使う場合、このコマンドは `.next/BUILD_ID` を確認し、build が無ければ先に `npm.cmd run build`、`npm.cmd run e2e:public`、または `npm.cmd run release:check` を使うように案内します。

```powershell
npm run e2e:public:run
```

E2E の build guard と `E2E_BASE_URL` 分岐だけを軽く自己検査したい場合は、次を使います。

```powershell
npm run e2e:public:test
```

認証後の保存導線を確認する場合は、テスト用ユーザーを用意してから次を使います。credential は認証情報のことです。`.env.local` や CI の secret に置き、Git には commit しません。

```powershell
$env:E2E_AUTH_EMAIL='test-user@example.com'
$env:E2E_AUTH_PASSWORD='long-test-password'
npm run e2e:auth
```

既に起動済みの staging や本番 URL を相手にする場合は、`E2E_BASE_URL` を指定します。staging は本番に近い検証用環境のことです。

```powershell
$env:E2E_BASE_URL='https://<your-staging-domain>'
$env:E2E_AUTH_EMAIL='test-user@example.com'
$env:E2E_AUTH_PASSWORD='long-test-password'
npm run e2e:auth
```

`E2E_AUTH_MODE=signup` にすると signup から試します。ただし Supabase 側でメール確認が必須の場合は、事前に確認済みのテストユーザーで `login` を使う方が安定します。

認証付き E2E の安全ガードだけを軽く自己検査する場合は、次を使います。これは credential 不足、`E2E_AUTH_MODE` の誤り、local build 不足を、外部 Supabase に触る前に確認します。local build は、手元で作った本番用 build のことです。

```powershell
npm run e2e:auth:test
```

## 公開前の注意

本番への詳しい手順は `DEPLOYMENT.md` を参照してください。

公開時は `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を hosting 側の環境変数にも設定してください。secret key や service_role key は公開環境変数に入れません。

利用者に見せる案内は次のページにあります。

- `/legal/terms`: 利用規約と栄養・アレルギー注意書き
- `/legal/privacy`: プライバシーポリシー
- `/legal/attributions`: 画像クレジット

画像クレジットの内容は、Wikimedia Commons などの出典ページを優先します。作者・ライセンスが変わって見える場合は、出典ページ側を確認してください。

## 画像 URL SQL

レシピ画像は `recipes.image_urls` に入ります。manifest JSON から SQL を作る道具があります。

35 件ぶんの雛形は `supabase/recipe-images.template.json` です。これは URL を集める前の白地図で、レシピ名だけを全件そろえています。

seed レシピから雛形 JSON を出力することもできます。標準出力とは、コマンド実行結果として画面に表示される出力のことです。

```powershell
npm.cmd run recipe-images:template
```

実 URL を入れる作業用 manifest を `supabase\recipe-images.actual.json` として作る場合は、次を使います。既に同じファイルがある場合は止まります。作り直す時だけ `--force` を追加します。

```powershell
npm.cmd run recipe-images:init-actual
npm.cmd run recipe-images:init-actual -- --force
```

`supabase\recipe-images.actual.json`、`supabase\recipe-images.todo.md`、`supabase\recipe-images.sources.json` は作業用ファイルとして `.gitignore` に入れています。実 URL は actual manifest に集め、出典メモは sources JSON に残し、共有する成果物は生成後の migration SQL に寄せる運用です。

保存済みの雛形が seed から生成した雛形と同じかも確認できます。

```powershell
npm.cmd run recipe-images:check-generated-template
```

```powershell
npm.cmd run recipe-images:check-template
```

この雛形検査では、`supabase/migrations/002_seed_recipes.sql` と `supabase/migrations/005_detailed_recipes.sql` の seed レシピ名も照合します。seed は初期データのことで、アプリが最初から持つレシピ台帳です。雛形に足りない料理や、seed に無い料理名が混ざるとエラーになります。

画像 URL 投入前の残り件数を見たい場合は、report（診断レポート）を使います。空の `image_urls` が何件あるか、仮 URL や重複 URL が残っていないかを一覧できます。最後に `next actions` として、次に直す項目も表示します。

```powershell
npm.cmd run recipe-images:report -- supabase\recipe-images.template.json
```

未入力のレシピ名だけを一覧したい場合は、次を使います。

```powershell
npm.cmd run recipe-images:missing -- supabase\recipe-images.template.json
```

Markdown のチェックリストとして出したい場合は、次を使います。

```powershell
npm.cmd run recipe-images:missing-md -- supabase\recipe-images.template.json
```

チェックリストをファイルへ保存したい場合は、次を使います。既に `supabase\recipe-images.todo.md` がある場合は止まるので、作り直す時だけ `--force` を追加します。

```powershell
npm.cmd run recipe-images:missing-md-file -- supabase\recipe-images.template.json
npm.cmd run recipe-images:missing-md-file -- --force supabase\recipe-images.template.json
```

実 URL 作業用の `supabase\recipe-images.actual.json` を相手にする場合は、短縮コマンドも使えます。actual は「実作業用」という意味の目印です。

```powershell
npm.cmd run recipe-images:actual-report
npm.cmd run recipe-images:actual-missing
npm.cmd run recipe-images:actual-todo
```

`recipe-images:actual-todo` は `supabase\recipe-images.todo.md` にチェックリストを保存します。作り直す時だけ `--force` を追加します。

```powershell
npm.cmd run recipe-images:actual-todo -- --force
```

actual manifest がまだ無い状態で actual 系コマンドを実行した場合は、`recipe-images:init-actual` を実行するように案内されます。

どこから手を付けるか迷う場合は、まず workflow（作業手順の診断）を見ます。actual manifest、チェックリスト、migration SQL、source notes の有無、対象ファイルの場所、次に実行するコマンドを表示します。source notes がある場合は、通常検査の `sources-check` と、warning 修正用の `sources-report` も次アクションに出ます。placeholder attribution warning が残っている場合は、workflow 上にも件数が表示されます。

```powershell
npm.cmd run recipe-images:workflow
```

`recipe-images:actual-workflow` も同じ診断を開く別名として残しています。

自動化や記録に使う場合は JSON でも出せます。`--silent` を付けると npm の見出しを省き、JSON だけを取り出せます。

```powershell
npm.cmd run --silent recipe-images:workflow:json
```

JSON の形を確認したい場合は、schema（出力構造の説明）も出せます。

```powershell
npm.cmd run --silent recipe-images:workflow:schema
```

JSON には `status` が入ります。これは現在地を表す状態コードで、自動化や記録が「次に何をすべきか」を判断しやすくするための短い目印です。

主な値:

- `missing-actual-manifest`: actual manifest がまだ無い
- `collecting-image-urls`: URL 未入力のレシピが残っている
- `blocked-by-errors`: manifest の名前ずれなど、先に直すべき error がある
- `needs-warning-review`: 仮 URL や重複 URL などの warning が残っている
- `ready-to-generate-migration`: migration SQL を生成できる
- `migration-outdated`: 既存 migration SQL が actual manifest より古い
- `ready-to-apply-migration`: 既存 migration SQL が actual manifest と一致している

JSON には従来の `nextActions` に加えて、`nextActionItems` も入ります。これは action（次に実行する作業）を `id` / `type` / `command` / `path` などに分けた構造化データです。自動化では `type: "command"` の `command` を拾い、人が編集する作業は `type: "manual"` として扱えます。`path` はその action の主対象、`paths` は複数対象をまとめた一覧です。`summary.sourceNotes` には、出典メモ数、source note warning 数、placeholder attribution warning 数も入ります。

workflow の JSON 出力と人間向け表示を自己検査したい場合は、次を使います。自己検査は一時フォルダに仮の seed と actual manifest を作り、actual manifest が存在する状態でも JSON に余計な文字が混ざらないことを確認します。加えて、未入力・warning・error・migration 未生成・migration 古い・migration 一致の主要 `status` も確認します。schema と実際の workflow JSON の主な field が噛み合っていること、source notes の対象 path、report action、placeholder warning count が workflow に載ることも確認します。

```powershell
npm.cmd run recipe-images:workflow:test
```

actual manifest が完成している場合は、`migration sync` も表示します。`missing` は migration が未生成、`current` は actual manifest と migration が一致、`outdated` は actual manifest に対して migration が古い状態です。

まず manifest の形を確認します。

```powershell
npm.cmd run recipe-images:check -- supabase\recipe-images.example.json
```

この検査では、空のレシピ名、重複したレシピ名、空 URL、URL 形式の誤りを検出します。`example.com` の仮 URL は警告として表示されます。実 URL を入れるときは、雛形をコピーして `image_urls` に `https://...` の画像 URL を入れてから検査します。35 件すべての seed レシピと照合したい場合は、`--require-seed-recipes` を追加します。

```powershell
npm.cmd run recipe-images:check -- --require-seed-recipes supabase\recipe-images.template.json
```

本番投入前は strict 検査を使います。strict は厳格モードのことで、通常は警告扱いの `example.com` 仮 URL や重複 URL もエラーとして止めます。

```powershell
npm.cmd run recipe-images:check-strict -- supabase\recipe-images.actual.json
```

actual manifest を既定の相手にする短縮コマンドもあります。

```powershell
npm.cmd run recipe-images:actual-check
```

実 URL の出典メモも確認できます。sources は出典という意味で、`recipe` / `image_url` / `source_page_url` / `author` / `license` / `fit` を持つ JSON です。この検査では、actual manifest の全 `image_urls` に対応する source note（出典メモ）があるか、source note 側に余計な URL が混ざっていないかを見ます。`fit` は画像が料理そのものにどれくらい合うかの目印で、`exact` / `close` / `representative` を使います。author / license に `See ...` のような再確認メモが残っている場合は、warning に対象 recipe 名も出します。

```powershell
npm.cmd run recipe-images:sources-check
```

warning の修正対象を source page URL つきで一覧したい場合は、source report（出典レポート）を使います。出典ページを開いて author / license を確認する時の作業地図になります。

```powershell
npm.cmd run recipe-images:sources-report
```

自動化や引き継ぎで同じ情報を JSON として読みたい場合は、次を使います。JSON はプログラムが読みやすい表形式のデータです。

```powershell
npm.cmd run --silent recipe-images:sources-report:json
```

人が source page を開きながら確認するチェックリストとして見たい場合は、Markdown でも出せます。Markdown は `- [ ]` のようなチェックボックスを書けるメモ形式です。

```powershell
npm.cmd run recipe-images:sources-report:markdown
```

公開直前に、再確認メモが残っている出典も失敗として止めたい場合は strict を使います。strict は厳格モードという意味で、通常は warning の項目も error として扱います。

```powershell
npm.cmd run recipe-images:sources-check:strict
```

strict 検査を通った manifest から SQL を生成する場合は、次を使います。

```powershell
npm.cmd run recipe-images:sql-strict -- supabase\recipe-images.actual.json
```

SQL を migration（データベース変更ファイル）として保存したい場合は、`--output` を使います。既に同じファイルがある場合は止まります。意図して上書きする時だけ `--force` を追加してください。

```powershell
npm.cmd run recipe-images:sql-strict -- --output supabase\migrations\007_recipe_images.sql supabase\recipe-images.actual.json
```

既定の保存先 `supabase\migrations\007_recipe_images.sql` へ出す短縮コマンドもあります。

```powershell
npm.cmd run recipe-images:migration -- supabase\recipe-images.actual.json
```

actual manifest から既定の `007_recipe_images.sql` へ出す短縮コマンドもあります。

```powershell
npm.cmd run recipe-images:actual-migration
```

既存の `007_recipe_images.sql` を意図して作り直す場合は、`--force` を追加します。

```powershell
npm.cmd run recipe-images:migration -- --force supabase\recipe-images.actual.json
```

```powershell
npm.cmd run recipe-images:sql -- supabase\recipe-images.example.json
```

生成された SQL は、内容を確認してから Supabase SQL Editor で実行します。実行結果には `status` 列が出ます。`updated` は `public.recipes` の同名レシピへ画像 URL を入れられた行、`missing` は database（データベース）側に同じレシピ名が無かった行です。`missing` が出たら、seed migration（初期データを入れる SQL）が適用済みか、manifest の `name` が seed のレシピ名と完全一致しているかを確認します。

## 進捗

全体方針は `ROADMAP.md`、セッションごとの細かい記録は `progress/PROGRESS_NN.md` を参照してください。
