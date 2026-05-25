# 完全栄養ランダム献立達人

パステル + HUD アクセントの週間献立アプリです。献立生成、レシピ図鑑、在庫、買い物リスト、毎週固定の管理をひとつの画面群にまとめます。HUD は、必要な情報を画面上に重ねて見せるゲーム風の情報表示のことです。

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
```

`003` は過去に別途適用済みとして扱われています。新しい環境で必要になった場合は、`meal_plans` の `user_id, week_start_date` unique 制約を確認してください。

## 検査

まとめて確認する場合:

```powershell
npm run check
```

`check` は setup doctor の自己検査、画像 URL workflow の自己検査、画像 URL workflow 診断、型検査、lint、build を順番に実行します。lint はコードの書き方の検査、build は本番用に組み立てられるかの検査です。画像 URL workflow 診断は、actual manifest がまだ無い場合でも次の手順を表示して通ります。

個別に確認する場合:

```powershell
npm run setup:doctor:test
npm run recipe-images:workflow:test
npm run recipe-images:workflow
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

どこから手を付けるか迷う場合は、まず workflow（作業手順の診断）を見ます。actual manifest、チェックリスト、migration SQL、source notes の有無、対象ファイルの場所、次に実行するコマンドを表示します。

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

JSON には従来の `nextActions` に加えて、`nextActionItems` も入ります。これは action（次に実行する作業）を `id` / `type` / `command` / `path` などに分けた構造化データです。自動化では `type: "command"` の `command` を拾い、人が編集する作業は `type: "manual"` として扱えます。`path` はその action の主対象、`paths` は複数対象をまとめた一覧です。

workflow の JSON 出力と人間向け表示を自己検査したい場合は、次を使います。自己検査は一時フォルダに仮の seed と actual manifest を作り、actual manifest が存在する状態でも JSON に余計な文字が混ざらないことを確認します。加えて、未入力・warning・error・migration 未生成・migration 古い・migration 一致の主要 `status` も確認します。schema と実際の workflow JSON の主な field が噛み合っていること、source notes の対象 path が workflow に載ることも確認します。

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
