# 完全栄養ランダム献立達人 ROADMAP

> プロジェクト全体の中長期計画。**「次に何をやるか」と「将来どこに向かうか」**を 1 ファイルで把握。
> セッションごとの細かい進捗は `progress/PROGRESS_NN.md`、メモリ運用は Claude 側の `project_meal_planner.md` を参照。

**最終更新:** 2026-05-25 (PROGRESS_89 時点。仮タイトル確定・画像 URL 適用・UI 改善まで反映)

---

## ビジョン

Blue Archive 風パステル + HUD アクセントの UI で、**「考えなくていい週間献立アプリ」**を作る。

- 利用シーン: 「今夜何作ろう」「冷蔵庫に何残ってる」「カロリー大丈夫？」「買い物リスト欲しい」を 1 アプリで完結
- ターゲット: 自炊負担を軽くしたい家庭・個人
- 体験のキモ: **ペルソナによる "誰かに任せる" 感**（mei/arisa/tsuzuri/iris/cleio/milra の 6 人）

---

## ステータス凡例

- ✅ 完了
- 🚧 着手中 / 一部完了
- ⏳ 計画あり、未着手
- 💭 アイデア段階、未確定

---

## フェーズ全体図

```
Phase 1 (基盤)         ✅ 完了 (52a04a2..14fbf23)
Phase 2 (主要機能)     🚧 主要機能ほぼ完了、画像 URL 適用済み・UI 仕上げ中
Phase 3 (拡張・運用)   ⏳ 計画段階
Phase 4 (将来構想)     💭 アイデア
```

---

## Phase 1: 基盤構築 ✅ 完了

- ✅ 認証（signup / login / middleware）
- ✅ DB スキーマ + RLS
- ✅ レシピシード 25 件 (`002_seed_recipes.sql`)
- ✅ ボトムナビ付きレイアウト
- ✅ Tailwind + Blue Archive 風デザイントークン (`globals.css` の `--accent` 系)

## Phase 2: 主要機能 🚧

### 完了
- ✅ ペルソナ定義（6 人: mei/arisa/tsuzuri/iris/cleio/milra）
- ✅ 献立生成エンジン（filter/scorer/generator）
- ✅ `/api/generate-plan` (POST、ペルソナ優先順位込み)
- ✅ ミールカード 4 状態（通常/ロック/外食/未定）
- ✅ ダッシュボード（7日×3食グリッド、週ナビ、生成ボタン、統計バッジ）
- ✅ レシピ詳細ページ (`/recipes/[id]`)、人数スケール、PFC 表示
- ✅ 栄養グラフ（週合計 PFC + 日別カロリー）
- ✅ 在庫管理 (CRUD、賞味期限色分け)
- ✅ 設定ページ（display_name / default_servings / persona / disliked / allergic / 目標カロリー / PFC バランス）
- ✅ 買い物リスト本実装（自動消費カウント + カゴ永続化）
- ✅ レシピ詳細手順を 35 件全件で詳細化（プロのコツ込み）
- ✅ マイグレーション 005/006 適用 + 動作確認（PROGRESS_09）
- ✅ 常備品テンプレート UI（PROGRESS_09）
- ✅ 消費判定の手動オーバーライド / 外食スキップ UI（PROGRESS_10）
- ✅ レシピ画像 UI 対応（PROGRESS_12）
  - MealCard は `recipe.image_urls?.[0]` を背景表示
  - レシピ詳細ページは写真ヒーロー + 画像なし fallback 表示
  - 手順ごとの `step.image_url` 表示に対応
- ✅ レシピ図鑑 / 検索 UI（PROGRESS_13）
  - `/recipes` に一覧追加
  - 料理名・食材・タグ検索、食事タイミング、ジャンル、調理時間で絞り込み
  - ボトムナビに「レシピ」を追加
- ✅ レシピから今週の献立へ追加（PROGRESS_14）
  - `/api/assign-recipe` 追加
  - レシピ詳細に曜日・朝昼夜・固定の選択パネルを追加
  - 既存の今週プランがなければ空の週を作成して保存
- ✅ レシピ図鑑からクイック追加（PROGRESS_15）
  - 図鑑カードの「今週へ」から選択シートを表示
  - 追加 UI を `RecipeAssignControls` に共通化
- ✅ レシピ図鑑の操作性改善（PROGRESS_16）
  - クイック追加後に「献立を見る」toast action を表示
  - 在庫食材と一致する材料数をカードに表示
- ✅ レシピ図鑑の在庫ゆる一致（PROGRESS_17）
  - 表記ゆれ辞書 + 部分一致で「鶏肉」「鶏もも肉」などを近く扱う
  - `調味料` を除いた主材料ベースで `在庫 2/5` と作れそうスコアを表示
  - 在庫順ソート / 在庫一致あり絞り込みを追加
- ✅ レシピ図鑑の PFC / kcal フィルタ（PROGRESS_18）
  - kcal 上限で絞り込み
  - `P多め` / `F控えめ` / `C控えめ` の複数条件フィルタを追加
  - カードに PFC kcal 比率を表示
- ✅ レシピ割り当ての固定範囲 UI（PROGRESS_19）
  - `自由` / `今週固定` / `毎週固定` の 3 モードを追加
  - `今週固定` は `meal_plans.plan` の `*_locked` に保存
  - `毎週固定` は `locked_meals` へ upsert し、次回以降の生成にも反映
- ✅ 毎週固定の一覧・解除 UI（PROGRESS_20）
  - 設定画面に `locked_meals` の一覧を追加
  - 曜日・食事枠・レシピ名を表示
  - 不要になった毎週固定を解除可能
- ✅ 毎週固定の編集 API / UI（PROGRESS_21）
  - `/api/weekly-locks/[id]` に `PATCH` / `DELETE` を追加
  - 毎週固定の解除を認証つき API 経由に変更
  - レシピ差し替え / 外食固定への変更を設定画面で可能に
- ✅ Supabase 未設定時の起動案内（PROGRESS_22）
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 不足時は `/setup` へ誘導
  - Runtime Error ではなく不足キーと `.env.local` の形を表示
  - API は未設定時に 503 JSON を返す
- ✅ 毎週固定の曜日・食事枠変更 UI（PROGRESS_23）
  - 設定画面で既存の毎週固定を別曜日・別食事枠へ移動可能
  - `/api/weekly-locks/[id]` の `PATCH` が `dayOfWeek` / `mealType` を受け取る
  - 移動先に既存固定がある場合は、画面と API の両方で衝突を明示
- ✅ README / setup 画面の起動手順整備（PROGRESS_23）
  - `.env.example` から `.env.local` を作る導線を明記
  - README をプロジェクト固有の内容へ更新
- ✅ Supabase なしで見られるデモ画面（PROGRESS_24）
  - `/demo` を追加し、実 DB 接続なしで献立・栄養・固定枠の見た目を確認可能に
  - 既存の `MealCard` / `NutritionChart` / `generateWeekPlan` を再利用
  - `/setup` と README からデモへ誘導
- ✅ デモ画面の買い物リスト（PROGRESS_25）
  - `/demo` の献立から既存の `buildShoppingList` で買い物リストを生成
  - デモ在庫・常備品を反映し、カテゴリ別に表示
  - デモ上でチェック済み状態を操作可能
- ✅ デモ画面のレシピ詳細パネル（PROGRESS_26）
  - `/demo` の献立カードから材料・栄養・手順を確認可能
  - `MealCard` に `onSelect` を追加し、デモでは画面遷移せず詳細を開く
  - `Escape` / 閉じるボタンでパネルを閉じられる
- ✅ デモ画面の毎週固定編集サンプル（PROGRESS_27）
  - `/demo` で曜日・食事・内容を変更し、献立へ即時反映
  - 外食固定とレシピ固定を切替可能
  - 同じ曜日・食事枠への重複固定を簡易ガード
- ✅ デモ画面のタブ整理（PROGRESS_28）
  - `/demo` を `献立` / `固定` / `買い物` / `栄養` のタブ表示に整理
  - 初期表示は週献立にして、固定・買い物・栄養は必要時だけ表示
  - ブラウザでタブ切替と固定変更の反映を確認
- ✅ デモ画面のモバイル献立表示改善（PROGRESS_29）
  - 狭い画面では `/demo` の献立カードを 1 列表示に変更
  - `MealCard` は携帯幅で 16:9、`sm` 以上で従来の正方形に戻す
  - ブラウザ実測 319px 幅で、カードが横長に表示されることを確認
- ✅ デモ画面のモバイル詳細パネル改善（PROGRESS_30）
  - `/demo` のレシピ詳細パネルを携帯幅で読みやすい余白・段組みに調整
  - 栄養カードは携帯幅で 2 列、広い画面で 4 列に変更
  - ペルソナ選択と統計カードの横はみ出しも `min-w-0` で解消
- ✅ デモ画面のモバイル固定・買い物タブ改善（PROGRESS_31）
  - 固定編集タブの select と初期化ボタンを携帯幅で押しやすく調整
  - 買い物リストのチェック行と checkbox を携帯幅で大きめに調整
  - ブラウザ実測 319px 幅で、固定変更とチェック状態更新を確認
- ✅ デモ画面のモバイル栄養タブ改善（PROGRESS_32）
  - `NutritionChart` のヘッダーと PFC 数値を携帯幅で縦に逃がす
  - 日別カロリーバーに `min-w-0` を追加し、狭い幅での横はみ出しを防止
  - ブラウザ実測 319px 幅で、栄養タブの横はみ出しなしを確認
- ✅ Supabase 未設定時の鍵取得案内改善（PROGRESS_33）
  - `/setup` に Supabase Dashboard / API keys 公式説明への導線を追加
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` へ入れる値を明示
  - secret key / service_role key を公開環境変数へ入れない注意を追加
- ✅ README と setup の Supabase 導線同期（PROGRESS_34）
  - README に `/setup` と `/demo` の導線を明記
  - README に Supabase Dashboard / API keys 公式説明リンクを追加
  - publishable key / legacy anon key と secret key / service_role key の扱いを明記
- ✅ レシピ画像 manifest 検証導線（PROGRESS_35）
  - `recipe-images:check` を追加し、SQL 生成前に manifest を検査可能にした
  - 空レシピ名 / 重複名 / 空 URL / URL 形式不正を検出
  - `example.com` 仮 URL は警告として表示
- ✅ 35 件レシピ画像 manifest 雛形（PROGRESS_36）
  - `supabase/recipe-images.template.json` に全 35 件のレシピ名を列挙
  - `recipe-images:check-template` で URL 未投入の雛形だけを検査可能にした
  - `--allow-empty` は `--check` 専用にし、SQL 生成では空 URL を許さない
- ✅ 画像 manifest と seed レシピ名の同期検査（PROGRESS_37）
  - `--require-seed-recipes` を追加し、002/005 の seed レシピ名と manifest を照合
  - 雛形に足りないレシピ名 / seed に存在しない余分なレシピ名をエラー化
  - `recipe-images:check-template` は 35 件の seed coverage も確認する
- ✅ seed からの画像 manifest 雛形生成（PROGRESS_38）
  - `--print-template` を追加し、002/005 の seed レシピ名から雛形 JSON を出力可能にした
  - `recipe-images:template` を追加し、35 件の空 `image_urls` 雛形を再生成できるようにした
  - 生成結果が `supabase/recipe-images.template.json` と一致することを確認
- ✅ 保存済み画像 manifest 雛形の生成一致検査（PROGRESS_39）
  - `--check-generated-template` を追加し、保存済み template と seed 生成 template を比較可能にした
  - `recipe-images:check-generated-template` で `supabase/recipe-images.template.json` の drift を検出できる
  - 空白差ではなく JSON を正規化して比較する
- ✅ 本番投入向け画像 manifest strict 検査（PROGRESS_40）
  - `--strict` を追加し、通常 warning の `example.com` 仮 URL / 重複 URL をエラー化
  - `recipe-images:check-strict` を追加し、seed coverage と warning なしをまとめて検査可能にした
  - strict は `--allow-empty` と併用不可にして、URL 未投入の雛形を本番扱いしない
- ✅ strict SQL 生成導線（PROGRESS_41）
  - `recipe-images:sql-strict` を追加し、seed coverage / warning なしを満たした manifest だけ SQL 生成できるようにした
  - 35 件の一時 manifest で strict SQL 生成が通ることを確認
  - example manifest は strict SQL 生成で期待どおり停止することを確認
- ✅ 画像 URL SQL の更新結果 status 表示（PROGRESS_42）
  - 生成 SQL を `update` と確認 `select` の単一文にし、CTE の有効範囲切れを解消
  - 実行結果に `updated` / `missing` の status を出して、DB 側のレシピ名不一致を見つけやすくした
  - strict SQL 生成でも同じ確認つき SQL を出せることを確認
- ✅ 画像 URL SQL のファイル出力導線（PROGRESS_43）
  - `scripts/generate-recipe-image-sql.mjs` に `--output <file>` を追加
  - 既存ファイルは既定で上書きせず、意図した時だけ `--force` で置換できるようにした
  - `--check` など SQL 生成以外のモードでは `--output` を拒否する
- ✅ 画像 URL migration 生成コマンド（PROGRESS_44）
  - `recipe-images:migration` を追加し、strict 検査つきで `supabase/migrations/007_recipe_images.sql` を生成可能にした
  - `--force` を追加した時だけ既存 migration を作り直せる
  - 一時 manifest で生成・既存ファイル保護・force 上書きを確認
- ✅ 画像 URL manifest 診断レポート（PROGRESS_45）
  - `--report` と `recipe-images:report` を追加し、URL 投入状況を一覧できるようにした
  - 空 URL / 仮 URL / 重複 URL / invalid URL / seed coverage / migration readiness を表示
  - 雛形 manifest と example manifest の両方で診断結果を確認
- ✅ 画像 URL manifest 診断 next actions（PROGRESS_46）
  - report 末尾に `next actions` を追加し、次に直す項目を表示
  - 空 URL・仮 URL・invalid URL・重複 URL・error の優先修正を案内
  - ready 状態では `recipe-images:migration` 実行コマンドを表示
- ✅ 画像 URL 未入力レシピ一覧（PROGRESS_47）
  - `--list-missing-images` と `recipe-images:missing` を追加
  - URL 未入力のレシピ名を一覧し、画像収集の作業リストとして使えるようにした
  - seed coverage error がある manifest は一覧後に失敗して、名前ずれも見逃さない
- ✅ 画像 URL 収集チェックリスト（PROGRESS_48）
  - `--missing-markdown` と `recipe-images:missing-md` を追加
  - URL 未入力レシピを Markdown のチェックボックス形式で出力可能にした
  - `--missing-markdown` 単独利用は拒否し、missing 一覧専用の出力形式として扱う
- ✅ 画像 URL 収集チェックリスト保存（PROGRESS_49）
  - `--missing-output <file>` と `recipe-images:missing-md-file` を追加
  - 既定で `supabase/recipe-images.todo.md` へ Markdown チェックリストを書き出せるようにした
  - 既存ファイルは `--force` なしで上書きしない
- ✅ 実 URL 入力用 manifest 初期生成（PROGRESS_50）
  - `--template-output <file>` と `recipe-images:init-actual` を追加
  - `supabase/recipe-images.actual.json` を seed から安全に初期生成できるようにした
  - 既存ファイルは `--force` なしで上書きしない
- ✅ 実 URL 作業用 manifest の短縮導線（PROGRESS_51）
  - `recipe-images:actual-report` / `actual-missing` / `actual-todo` を追加
  - `recipe-images:actual-check` / `actual-migration` で本番前検査と migration 生成を短縮
  - `recipe-images.actual.json` と `recipe-images.todo.md` を作業用ファイルとして Git 管理から除外
- ✅ 画像 manifest エラー案内改善（PROGRESS_52）
  - manifest ファイル不在時に Node の stack trace ではなく、次に実行すべきコマンドを表示
  - `recipe-images.actual.json` 不在時は `recipe-images:init-actual` へ誘導
  - JSON 不正や `recipes` 配列不足も短いエラーメッセージで停止
  - PowerShell などで付く UTF-8 BOM を受け流して JSON を読めるようにした
- ✅ 画像 actual workflow 診断（PROGRESS_53）
  - `recipe-images:actual-workflow` を追加し、actual manifest / todo / migration の有無を一覧
  - actual manifest が無い時は初期生成、ある時は残 URL 数と次のコマンドを表示
  - migration ready の判定と `actual-check` / `actual-migration` への導線を一か所に集約
- ✅ 画像 migration sync 診断（PROGRESS_54）
  - workflow に `migration sync` を追加し、missing / current / outdated / not ready を表示
  - actual manifest と `007_recipe_images.sql` の生成 SQL を比較して、古い migration を検出
  - outdated 時は `recipe-images:actual-migration -- --force` へ誘導
- ✅ setup 画面の設定済み導線（PROGRESS_55）
  - Supabase 環境変数が揃っている時は `SETUP READY` と表示
  - 設定済み時はログイン / ダッシュボードへの導線を表示
  - 未設定時は従来どおりデモと鍵取得手順を案内
- ✅ setup 画面の利用可否ガイド（PROGRESS_56）
  - Supabase 未設定でも開ける `/demo` と、設定後に使うログイン/実データ画面を分けて表示
  - 未設定時はログインが鍵設定後に有効になることを明示
  - 設定済み時は利用可としてログイン導線を表示
- ✅ Supabase env 仮値検出（PROGRESS_57）
  - `.env.example` の仮 URL / 仮 key のままなら `SETUP CHECK` として表示
  - Project URL の形式不正を setup 画面で案内
  - middleware の接続判定も仮値・不正値を未設定扱いにして、ログイン前に `/setup` へ誘導
- ✅ Supabase env 判定の一元化（PROGRESS_58）
  - browser / server / middleware の Supabase client 作成で同じ env issue 判定を利用
  - middleware は trim 済みの env 値を `createServerClient` に渡す
  - API 503 で `issues` と `setupPath` を返し、どの値が問題か分かるようにした
- ✅ setup status API（PROGRESS_59）
  - `/api/setup-status` で Supabase env の状態を JSON として確認できるようにした
  - Supabase 未設定時でも診断 API だけは 503 にせず開く
  - 通常 API は middleware でログイン redirect せず、各 route handler の 401 応答に任せる
- ✅ setup 画面の request-time rendering（PROGRESS_60）
  - `/setup` で `connection()` を使い、Supabase env 判定を build 時ではなく request 時に読むようにした
  - `next build` の route 一覧で `/setup` が dynamic route として出ることを確認
  - `/api/setup-status` と `/setup` の表示が同じ env 判定に揃うようにした
- ✅ Supabase setup status helper 共通化（PROGRESS_61）
  - `getSupabaseSetupStatus()` を追加し、`ok/status/issues/missingKeys/setupPath` を一か所で組み立てるようにした
  - `/setup` と `/api/setup-status` の `required/check/ready` 判定の重複を解消
  - `SupabaseEnvKey` / `SupabaseSetupStatus` 型を追加し、診断 JSON の形を明示
- ✅ 通常 API 503 の setup status 共通化（PROGRESS_62）
  - middleware の Supabase 未設定 503 も `getSupabaseSetupStatus()` を使うようにした
  - `/api/generate-plan` などの失敗 JSON に `status` と `missingKeys` も含めるようにした
  - redirect 先も helper の `setupPath` を使い、診断導線の出どころを一つにした
- ✅ setup status JSON の no-store 化（PROGRESS_63）
  - `/api/setup-status` に `Cache-Control: no-store` を付け、診断結果が古く保存されにくいようにした
  - middleware の Supabase 未設定 503 にも同じ `Cache-Control` を付けた
  - cache header 値を `SUPABASE_SETUP_STATUS_CACHE_CONTROL` として共通化した
- ✅ typecheck script 追加（PROGRESS_64）
  - `npm run typecheck` を `tsc --noEmit` として追加
  - README の検査手順を `npm run typecheck` / `npm run lint` / `npm run build` に揃えた
  - heartbeat の検証指示とローカル手順の言葉を一致させた
- ✅ 一括 check script 追加（PROGRESS_65）
  - `npm run check` を `typecheck` / `lint` / `build` の連続実行として追加
  - README に一括確認と個別確認の両方を記載
  - heartbeat の標準検証を一命令で再現できるようにした
- ✅ Supabase setup doctor 追加（PROGRESS_66）
  - `npm run setup:doctor` で `.env.local` などの Supabase 公開鍵設定を診断可能にした
  - `setup:doctor:strict` で未設定・仮値・URL 形式違いを終了コードにも反映可能にした
  - README にブラウザを開く前のローカル診断手順を追記
- ✅ Supabase setup doctor JSON 出力（PROGRESS_67）
  - `npm run setup:doctor:json` で診断結果を JSON として出力可能にした
  - JSON でも鍵の実値は出さず、ファイル有無・参照元・不足キー・issue だけを返す
  - README に自動化向けの JSON 出力手順を追記
- ✅ setup 画面への doctor 導線追加（PROGRESS_68）
  - `/setup` の `.env.local` セクションに `npm run setup:doctor` を表示
  - JSON 診断用の `npm run --silent setup:doctor:json` も画面から確認可能にした
  - README に setup 画面側にも同じ案内があることを追記
- ✅ setup doctor help 追加（PROGRESS_69）
  - `npm run setup:doctor:help` で診断コマンドの使い方を表示可能にした
  - 未知の option を黙って無視せず、使い方への案内つきで失敗させるようにした
  - README と `/setup` に help 導線を追記
- ✅ setup doctor self-test 追加（PROGRESS_70）
  - `npm run setup:doctor:test` で診断 script の主要ケースを自己検査可能にした
  - 一時フォルダで未設定・仮値・正常値・strict 失敗・未知 option・help を検証
  - JSON 出力が Supabase URL / anon key の実値を漏らさないことも確認対象にした
- ✅ check への setup doctor self-test 組み込み（PROGRESS_71）
  - `npm run check` の先頭で `npm run setup:doctor:test` を実行するようにした
  - README の検査手順に `check` の内訳と個別 self-test を追記
  - 標準検査一発で setup doctor の回帰も検出できるようにした
- ✅ Supabase 診断 JSON schema version 追加（PROGRESS_72）
  - `/api/setup-status` と `setup:doctor:json` に `diagnosticSchemaVersion: 1` を追加
  - 両方の JSON に `requiredKeys` を追加し、必要な env key を明示
  - setup doctor self-test で schema version と required keys も検証
- ✅ 栄養計算の外食除外（PROGRESS_73）
  - `NutritionChart` が `is_eating_out_*` の立った食事枠を栄養合計から除外するようにした
  - 買い物リストと栄養グラフで、外食枠の扱いを一致させた
  - `/demo` とダッシュボードの栄養表示に反映
- ✅ 栄養集計 helper 共通化（PROGRESS_74）
  - `calculateDayNutrition` / `calculateWeekNutrition` を `src/lib/nutrition.ts` に追加
  - `NutritionChart` の内部集計を共通 helper 呼び出しへ置き換え
  - 外食除外込みの週次栄養集計を、将来の画面や検査でも再利用可能にした
- ✅ デモ状態サマリー強化（PROGRESS_75）
  - `/demo` 上部に買い物残数を表示
  - `/demo` 上部に `calculateWeekNutrition()` 由来の平均 kcal を表示
  - 買い物チェックや外食切替の影響が、タブを開く前の概況にも出るようにした
- ✅ デモ料理種類サマリー復帰（PROGRESS_76）
  - `/demo` 上部に料理種類数を戻した
  - 外食枠は料理種類数から除外し、家で作る料理の種類として読めるようにした
  - 5 つのサマリーカードが狭い幅でも段組みで崩れないようにした
- ✅ 画像 URL workflow 入口整理（PROGRESS_77）
  - `npm run recipe-images:workflow` を追加し、画像 URL 作業の最初の診断を短い名前で実行可能にした
  - workflow の次アクション表示も新しい短縮コマンドへ寄せた
  - README の画像 URL 手順で、まず workflow を見る流れを明記した
- ✅ 画像 URL workflow パス表示（PROGRESS_78）
  - `recipe-images:workflow` の actual manifest / todo checklist / migration SQL 表示に対象パスを添えた
  - README の workflow 説明に、対象ファイルの場所も表示されることを追記
  - 状態確認から編集対象へ迷わず進めるようにした
- ✅ check への画像 URL workflow 組み込み（PROGRESS_79）
  - `npm run check` の先頭側で `recipe-images:workflow` を実行するようにした
  - README の検査説明に、画像 URL workflow 診断が含まれることを追記
  - actual manifest 未作成時でも次の手順を表示して標準検査が通ることを明記
- ✅ 画像 URL workflow JSON 出力（PROGRESS_80）
  - `npm run recipe-images:workflow:json` を追加し、workflow 診断を構造化データで取得可能にした
  - 人間向け workflow 表示と JSON 出力が同じ診断オブジェクトを使うようにした
  - README に `npm.cmd run --silent recipe-images:workflow:json` の導線を追加した
- ✅ 画像 URL workflow JSON 自己検査（PROGRESS_81）
  - actual manifest が存在する状態でも `--workflow-json` が純粋な JSON だけを出すようにした
  - `npm run recipe-images:workflow:test` を追加し、欠損時・準備完了時・人間向け表示・競合 option を検査可能にした
  - `npm run check` に workflow 自己検査を組み込み、標準検査で JSON 出力の回帰を検出できるようにした
- ✅ 画像 URL workflow status 追加（PROGRESS_82）
  - `recipe-images:workflow` / `recipe-images:workflow:json` に現在地を表す `status` を追加した
  - `missing-actual-manifest` / `collecting-image-urls` / `ready-to-generate-migration` などで次の段階を判別可能にした
  - workflow 自己検査で status を確認し、README に状態コードの意味を追記した
- ✅ 画像 URL workflow status 検査拡充（PROGRESS_83）
  - `collecting-image-urls` / `needs-warning-review` / `blocked-by-errors` を自己検査で再現するようにした
  - `migration-outdated` / `ready-to-apply-migration` も一時 workspace の migration SQL で検査するようにした
  - README に workflow 自己検査で主要 status を確認することを追記した
- ✅ 画像 URL workflow nextActionItems 追加（PROGRESS_84）
  - workflow JSON に `nextActionItems` を追加し、次アクションを `id` / `type` / `command` / `path` で扱えるようにした
  - 従来の `nextActions` は文字列の互換出力として残し、人間向け workflow 表示も継続した
  - workflow 自己検査で構造化 action の `id` と `command` を確認するようにした
- ✅ 画像 URL workflow action path metadata 追加（PROGRESS_85）
  - `nextActionItems` の主要 action に `path` / `paths` を追加し、対象ファイルを機械的に追えるようにした
  - `nextActions` は `nextActionItems.label` から生成するように揃え、文字列と構造化 action のずれを抑えた
  - workflow 自己検査で actual manifest / todo / migration の対象 path を確認するようにした
- ✅ 画像 URL workflow schema 出力（PROGRESS_86）
  - `--workflow-schema` と `recipe-images:workflow:schema` を追加し、workflow JSON の構造を JSON で確認可能にした
  - schema に `status` 値、`WorkflowFileState`、`WorkflowActionItem`、`nextActions` の derivation を明記した
  - workflow 自己検査で schema command / status values / action type / paths metadata を確認するようにした
- ✅ 画像 URL workflow schema 照合検査（PROGRESS_87）
  - workflow 自己検査で schema と実 workflow JSON の主要 field を突き合わせるようにした
  - `WorkflowFileState` / `WorkflowActionItem` の型、status 値、`nextActions` derivation を共通検査にした
  - README と handoff に schema と実 JSON の照合検査が入ったことを追記した
- ✅ 画像 URL source notes 検査（PROGRESS_88）
  - `recipe-images:sources-check` を追加し、actual manifest の全 `image_urls` と `supabase/recipe-images.sources.json` の出典メモを照合できるようにした
  - workflow の file state と次アクションに source notes を追加し、SQL 適用前に出典検査へ進めるようにした
  - workflow 自己検査で source notes path と `check-image-sources` action を確認するようにした
- ✅ レシピ画像 URL 適用 + UI 仕上げ + 仮タイトル（PROGRESS_89）
  - `007_recipe_images.sql` を Supabase SQL Editor で適用し、35 件の画像 URL と 60 recipe row の反映を確認済み
  - ダッシュボードのカロリーバランス、献立固定 / 解除、料理詳細からの献立差し替え、円グラフ、材料分量表示を改善済み
  - 表示名を仮決まりで「完全栄養ランダム献立達人」に変更し、`app-title-shadow` で床落ち影の仮タイトル表現を追加
  - `NEXT_CHAT_HANDOFF.md` と Obsidian handoff note の保存・push 済み状態を確認済み

### 進行中 🚧
- 🚧 **タイトル仮デザイン**
  - 現在のアプリ名は「完全栄養ランダム献立達人」
  - `app-title-shadow` はテキスト見出し用の仮表現で、最終ロゴではない
  - 画像素材へ置き換える時は、テキスト影を削るか、画像用スタイルへ移行する

### 開発環境 🚧
- ✅ **引き継ぎ環境整備 + lint 修正**（PROGRESS_11）
  - `D:\Codex\meal-planner` に clone
  - `ShoppingClient.tsx` の React 19 lint 警告を `useSyncExternalStore` 化で解消
  - `npm run typecheck` / `eslint` / `next build` は通過

### 未着手 ⏳
優先度高い順:
1. **タイトル画像素材化**
  - 現在の `app-title-shadow` は仮の CSS 表現
  - 文字入り画像を使う場合は、日本語テキストの崩れを避けるため、生成画像だけに任せず最終配置を CSS / 画像編集で確認する
  - 置き換え後はダッシュボード、認証画面、デモ画面で表示を確認する
2. **調理工程写真の追加**
  - まず利用可能な実画像を探し、出典・作者・ライセンスを控える
  - 使える工程写真がない場合は、生成画像で統一感を出す
3. **実データでの追加ブラウザ確認**
  - `/recipes`、レシピ詳細、設定画面の固定導線と枠移動を実データで確認する
  - 設定画面の固定一覧が多い場合の見通し改善を検討する

## Phase 3: 拡張・運用 ⏳

### 機能拡張
- ✅ **レシピ検索 UI（初版）**
  - `/recipes` で料理名・食材・タグ・時間・ジャンル検索

- 🚧 **食材ベース検索 / レシピ検索の拡張**
  - 「冷蔵庫の鶏もも肉で作れるもの」「20分以内」「PFC バランス重視」
  - 在庫ゆる一致、在庫順ソート、作れそうスコアは実装済み
  - PFC / kcal 条件はレシピ図鑑に実装済み
  - 生成エンジンとの接続は未着手
- ⏳ **週単位の好み学習**
  - ロック/スキップ履歴からペルソナのスコアリング微調整
  - 「最近この人ばっかり選んでる」フィードバック
- ⏳ **複数ペルソナのブレンド生成**
  - 「平日は mei、週末は iris」みたいな曜日別アサイン
- ⏳ **買い物リストの分割**
  - スーパー単位 / カテゴリ単位で分割表示

### 運用改善
- ⏳ **画像生成の自動化**
  - 新規レシピ追加時に AI 画像生成して S3/Supabase Storage に保存
- ⏳ **マイグレーション運用ツール化**
  - 現状 Supabase SQL Editor 手動。CLI 導入か API 直叩きスクリプト化
  - 関連: [[feedback-multi-pc-git-workflow]]（手動運用の事故が起きやすい点）
- ⏳ **`recipeMap` の slim 化**
  - PROGRESS_07 で指摘済み。件数増加に備えて id+name のみクライアントに送る形に
- ⏳ **`006` の id 指定切替**
  - 現状 `where name = '...'` で対象指定 → レシピ名変更で破綻リスク

### コード品質
- ⏳ **E2E テスト整備** (Playwright?)
  - 認証フロー、献立生成、買い物リスト、設定保存
- ⏳ **エラー境界の整備**
  - Supabase 接続失敗時のフォールバック UI

## Phase 4: 将来構想 💭

- 💭 **モバイル対応強化**（PWA 化 / ホーム画面追加）
- 💭 **家族間共有**
  - 1 つの献立を複数アカウントで参照・編集
  - 在庫共有
- 💭 **健康データ連携**
  - Fitbit / Apple Health から実摂取カロリー取得 → 目標との差分でレシピ提案
- 💭 **AI レシピ生成**
  - 在庫材料からその場で新レシピ生成
- 💭 **音声入力**（push-to-talk プロジェクトと連携できるか？）
  - 「今日は外食」「明日 iris で生成」を音声で

---

## いま向かっている方向（"Now / Next / Later"）

### Now（このイテレーション）
- 仮タイトル「完全栄養ランダム献立達人」の状態を維持しつつ、最終ロゴ化の方針を決める
- 料理詳細の「つかんで入れる」「つかんで外す」の言葉を、必要ならさらに柔らかくする
- 実データで `/recipes`、レシピ詳細、設定画面の固定導線を追加確認する
- 変更後は `npm run check` / `git diff --check` / ブラウザ確認

### Next（次の 1-2 セッション目安）
- 本物の `.env.local` を入れて Supabase 接続確認
- `/recipes` / レシピ詳細 / 設定画面の固定導線と枠移動を実データでブラウザ確認
- 設定画面の固定一覧が多い場合の見通し改善を検討
- タイトル画像素材化、または工程写真追加のどちらを先に進めるか決める

### Later（その後）
- Phase 3 の機能拡張から優先度の高いものを選定

---

## 設計上の制約と原則

- **WeekPlan の曜日インデックスは 0=月曜**（日本式）
- **Next.js 16**: training data と API が異なる可能性大、`node_modules/next/dist/docs/` を要確認（`AGENTS.md` 参照）
- **JSONB カラム** (ingredients/steps/nutrition) と `DbRecipe` 型の整合性を要確認
- **Supabase RLS** で全テーブルガード。サービスロールキーは `.env.local` のみ
- **クライアントに送るデータ量**は意識する（`recipeMap` slim 化等）

---

## 開発再開のクイックスタート

```powershell
# 1. プロジェクトルートで Claude Code を起動
cd D:\Codex\meal-planner
claude

# 2. 状態確認
git status
git log --oneline -5

# 3. dev server
npm run dev
# → http://localhost:3000
```

詳細な「次に何をやるか」は最新の `progress/PROGRESS_NN.md` を参照。

---

## 関連ドキュメント

- [`progress/PROGRESS_89.md`](progress/PROGRESS_89.md) — 仮タイトル確定と現在地の整理
- [`progress/PROGRESS_88.md`](progress/PROGRESS_88.md) — 画像 URL source notes 検査
- [`progress/PROGRESS_87.md`](progress/PROGRESS_87.md) — 画像 URL workflow schema 照合検査
- [`progress/PROGRESS_86.md`](progress/PROGRESS_86.md) — 画像 URL workflow schema 出力
- [`progress/PROGRESS_85.md`](progress/PROGRESS_85.md) — 画像 URL workflow action path metadata 追加
- [`progress/PROGRESS_84.md`](progress/PROGRESS_84.md) — 画像 URL workflow nextActionItems 追加
- [`progress/PROGRESS_83.md`](progress/PROGRESS_83.md) — 画像 URL workflow status 検査拡充
- [`progress/PROGRESS_82.md`](progress/PROGRESS_82.md) — 画像 URL workflow status 追加
- [`progress/PROGRESS_81.md`](progress/PROGRESS_81.md) — 画像 URL workflow JSON 自己検査
- [`progress/PROGRESS_80.md`](progress/PROGRESS_80.md) — 画像 URL workflow JSON 出力
- [`progress/PROGRESS_79.md`](progress/PROGRESS_79.md) — check への画像 URL workflow 組み込み
- [`progress/PROGRESS_78.md`](progress/PROGRESS_78.md) — 画像 URL workflow パス表示
- [`progress/PROGRESS_77.md`](progress/PROGRESS_77.md) — 画像 URL workflow 入口整理
- [`progress/PROGRESS_76.md`](progress/PROGRESS_76.md) — デモ料理種類サマリー復帰
- [`progress/PROGRESS_75.md`](progress/PROGRESS_75.md) — デモ状態サマリー強化
- [`progress/PROGRESS_74.md`](progress/PROGRESS_74.md) — 栄養集計 helper 共通化
- [`progress/PROGRESS_73.md`](progress/PROGRESS_73.md) — 栄養計算の外食除外
- [`progress/PROGRESS_72.md`](progress/PROGRESS_72.md) — Supabase 診断 JSON schema version 追加
- [`progress/PROGRESS_71.md`](progress/PROGRESS_71.md) — check への setup doctor self-test 組み込み
- [`progress/PROGRESS_70.md`](progress/PROGRESS_70.md) — setup doctor self-test 追加
- [`progress/PROGRESS_69.md`](progress/PROGRESS_69.md) — setup doctor help 追加
- [`progress/PROGRESS_68.md`](progress/PROGRESS_68.md) — setup 画面への doctor 導線追加
- [`progress/PROGRESS_67.md`](progress/PROGRESS_67.md) — Supabase setup doctor JSON 出力
- [`progress/PROGRESS_66.md`](progress/PROGRESS_66.md) — Supabase setup doctor 追加
- [`progress/PROGRESS_65.md`](progress/PROGRESS_65.md) — 一括 check script 追加
- [`progress/PROGRESS_64.md`](progress/PROGRESS_64.md) — typecheck script 追加
- [`progress/PROGRESS_63.md`](progress/PROGRESS_63.md) — setup status JSON の no-store 化
- [`progress/PROGRESS_62.md`](progress/PROGRESS_62.md) — 通常 API 503 の setup status 共通化
- [`progress/PROGRESS_61.md`](progress/PROGRESS_61.md) — Supabase setup status helper 共通化
- [`progress/PROGRESS_60.md`](progress/PROGRESS_60.md) — setup 画面の request-time rendering
- [`progress/PROGRESS_59.md`](progress/PROGRESS_59.md) — setup status API + middleware API 例外整理
- [`progress/PROGRESS_12.md`](progress/PROGRESS_12.md) — レシピ画像 UI + 詳細画面 GUI 改善
- [`progress/PROGRESS_13.md`](progress/PROGRESS_13.md) — レシピ図鑑 + 画像 SQL 生成導線
- [`progress/PROGRESS_14.md`](progress/PROGRESS_14.md) — レシピ詳細から今週の献立へ追加
- [`progress/PROGRESS_15.md`](progress/PROGRESS_15.md) — レシピ図鑑からクイック追加
- [`progress/PROGRESS_16.md`](progress/PROGRESS_16.md) — クイック追加後 toast action + 在庫一致表示
- [`progress/PROGRESS_17.md`](progress/PROGRESS_17.md) — 在庫ゆる一致 + 作れそうスコア
- [`progress/PROGRESS_22.md`](progress/PROGRESS_22.md) — Supabase 未設定時の起動案内
- [`progress/PROGRESS_23.md`](progress/PROGRESS_23.md) — 毎週固定の曜日・食事枠移動
- [`progress/PROGRESS_24.md`](progress/PROGRESS_24.md) — Supabase なしで見られるデモ画面
- [`progress/PROGRESS_25.md`](progress/PROGRESS_25.md) — デモ画面の買い物リスト
- [`progress/PROGRESS_26.md`](progress/PROGRESS_26.md) — デモ画面のレシピ詳細パネル
- [`progress/PROGRESS_27.md`](progress/PROGRESS_27.md) — デモ画面の毎週固定編集サンプル
- [`progress/PROGRESS_28.md`](progress/PROGRESS_28.md) — デモ画面のタブ整理
- [`progress/PROGRESS_29.md`](progress/PROGRESS_29.md) — デモ画面のモバイル献立表示改善
- [`progress/PROGRESS_30.md`](progress/PROGRESS_30.md) — デモ画面のモバイル詳細パネル改善
- [`progress/PROGRESS_31.md`](progress/PROGRESS_31.md) — デモ画面のモバイル固定・買い物タブ改善
- [`progress/PROGRESS_32.md`](progress/PROGRESS_32.md) — デモ画面のモバイル栄養タブ改善
- [`progress/PROGRESS_33.md`](progress/PROGRESS_33.md) — Supabase 未設定時の鍵取得案内改善
- [`progress/PROGRESS_34.md`](progress/PROGRESS_34.md) — README と setup の Supabase 導線同期
- [`progress/PROGRESS_35.md`](progress/PROGRESS_35.md) — レシピ画像 manifest 検証導線
- [`progress/PROGRESS_36.md`](progress/PROGRESS_36.md) — 35 件レシピ画像 manifest 雛形
- [`progress/PROGRESS_37.md`](progress/PROGRESS_37.md) — 画像 manifest と seed レシピ名の同期検査
- [`progress/PROGRESS_38.md`](progress/PROGRESS_38.md) — seed からの画像 manifest 雛形生成
- [`progress/PROGRESS_39.md`](progress/PROGRESS_39.md) — 保存済み画像 manifest 雛形の生成一致検査
- [`progress/PROGRESS_40.md`](progress/PROGRESS_40.md) — 本番投入向け画像 manifest strict 検査
- [`progress/PROGRESS_41.md`](progress/PROGRESS_41.md) — strict SQL 生成導線
- [`progress/PROGRESS_42.md`](progress/PROGRESS_42.md) — 画像 URL SQL の更新結果 status 表示
- [`progress/PROGRESS_43.md`](progress/PROGRESS_43.md) — 画像 URL SQL のファイル出力導線
- [`progress/PROGRESS_44.md`](progress/PROGRESS_44.md) — 画像 URL migration 生成コマンド
- [`progress/PROGRESS_45.md`](progress/PROGRESS_45.md) — 画像 URL manifest 診断レポート
- [`progress/PROGRESS_46.md`](progress/PROGRESS_46.md) — 画像 URL manifest 診断 next actions
- [`progress/PROGRESS_47.md`](progress/PROGRESS_47.md) — 画像 URL 未入力レシピ一覧
- [`progress/PROGRESS_48.md`](progress/PROGRESS_48.md) — 画像 URL 収集チェックリスト
- [`progress/PROGRESS_49.md`](progress/PROGRESS_49.md) — 画像 URL 収集チェックリスト保存
- [`progress/PROGRESS_50.md`](progress/PROGRESS_50.md) — 実 URL 入力用 manifest 初期生成
- [`progress/PROGRESS_21.md`](progress/PROGRESS_21.md) — 毎週固定の編集 API / UI
- [`progress/PROGRESS_20.md`](progress/PROGRESS_20.md) — 毎週固定の一覧・解除 UI
- [`progress/PROGRESS_19.md`](progress/PROGRESS_19.md) — レシピ割り当ての固定範囲 UI
- [`progress/PROGRESS_18.md`](progress/PROGRESS_18.md) — PFC / kcal フィルタ
- [`progress/PROGRESS_11.md`](progress/PROGRESS_11.md) — 引き継ぎ環境構築 + lint 修正 + 次タスク整理
- [`progress/PROGRESS_10.md`](progress/PROGRESS_10.md) — 外食オーバーライド UI + MealCard 写真ファースト化
- [`progress/PROGRESS_09.md`](progress/PROGRESS_09.md) — 005/006 動作確認 + 常備品テンプレート UI
- [`progress/PROGRESS_08.md`](progress/PROGRESS_08.md) — force-push 復旧 + 拠点移行
- [`progress/PROGRESS_07.md`](progress/PROGRESS_07.md) 以前 — 過去履歴
- [`README.md`](README.md) — プロジェクト概要（Next.js 標準）
- [`AGENTS.md`](AGENTS.md) — Claude Code 向け作業ルール（Next.js 16 注意点）
- [`CLAUDE.md`](CLAUDE.md) — AGENTS.md インポート
- `D:\ClaudeCode_project\sessions\` — セッション横断のナラティブ（複数 PC 移行の経緯など）
- `D:\ClaudeCode_project\lessons\` — インシデント教訓（force-push 事故等）
- Claude メモリ `project_meal_planner.md` — プロジェクト状態の最新サマリ

---

## 更新運用

- このファイルは **セッション毎に追記/調整** する想定
- Now → Next → Later はその時々で並べ替え
- 新規アイデアは Phase 4 (💭) に追加し、優先度が上がったら Phase 3 (⏳) に移動
- 完了したら ✅ にして打ち消し線で残すか、Phase ごとの「完了」セクションに移動
- 大きな方向転換があったら "ビジョン" セクションも見直す
