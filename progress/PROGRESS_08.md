# 超献立プランナー 開発進捗 #08

> **GitHub force-push 事故の復旧 + 作業拠点を `D:\projects\meal-planner` に確定** — 2026-05-21

PROGRESS_07 までは WSL2 ~/meal-planner で進めていたが、今セッションで重大な GitHub 上書き事故を検出。原因切り分け・復旧・拠点再編成を実施した。マイグレーション 004 のみ適用済み、005/006 は次セッションで継続。

---

## 何が起きていたか

### 別 PC でのミス（事故の元）

ユーザーが**別 PC で meal-planner を開発しようとした際、`git clone` ではなく `git init` から新規ローカルリポジトリを作成**。Windows 環境で Phase 1 までコミット (`09c1527 "Phase 1: 基盤構築完了"`) → その後 WSL2 に切り替えて `git remote add origin` + `push -u origin main` を実行した。

このとき GitHub の `main` には既にメイン PC (WSL2 ~/meal-planner) で開発済みの Phase 2 の 7 コミット (`4add5b5` まで) が存在していたが、新しいローカル repo は**共通祖先ゼロの完全別系統**だったため、push 操作で `main` 全体が orphan history で差し替えられた。

GitHub Events API はこれを `forced=false` と記録（`git init` → 初回 push と認識された可能性）。`09c1527` の Co-Authored-By が **Claude Sonnet 4.6** だったことから、別 PC の Claude Code セッションでの作業だったことも判明。

**結果**: GitHub `main` から Phase 2 の 7 コミットが消失。WSL2 ローカル側には Phase 2 が無傷で残っていたため**コードは失われていない**が、約 2 日間気付かないまま放置されていた。

### 検出

今セッション開始時、「マイグレーション 004/005/006 を適用したい」というユーザー依頼で進めていたが、ファイル参照の利便性のために `D:\ClaudeCode_project\.claude\worktrees\<name>\meal-planner` に GitHub から clone したところ、`git log` が Phase 1 の 1 コミットしかなかった。WSL 側で `git fetch` を試したら:

```
+ 4add5b5...09c1527 main       -> origin/main  (forced update)
```

`+` フラグ + `(forced update)` で異常を確定。`gh api repos/.../events` で push 履歴を辿り、2026-05-19 13:34:06 UTC の push が原因と特定。

---

## このセッションでやったこと

### Step 1: マイグレーション 004 適用

事故発覚前に進めていた作業。Supabase SQL Editor の既存タブ「食事レシピ25件のデータ投入」に 004 を貼り付けたところ:

1. `42601: syntax error at or near "$0"` — Monaco エディタのスニペット展開で `$0` プレースホルダが文字列として残ってしまった
2. `$0` を削除して再 Run → `42P07: relation "meal_plans_user_week_unique" already exists` — タブ内に 002 seed + 003 unique 制約が残っており、全文実行で 003 部分が重複適用エラー

**解決**: 新規タブを開いて 004 単独で貼り付け → Run。**1 タブ 1 マイグレーション**運用に切り替え。

### Step 2: GitHub force-push 事故の検出と復旧

WSL HEAD `4add5b5` を canonical として、GitHub を Phase 2 に巻き戻し。

```bash
cd ~/meal-planner

# 1) Phase 1 を保全タグ化（万一の戻し用）
git tag -a phase1-overwritten-backup 09c1527 -m '...'
git push origin phase1-overwritten-backup
# → 9e53ea9 (tag object) → 09c1527 (commit)

# 2) --force-with-lease で main を上書き
git push --force-with-lease=main:09c1527 origin main
# → + 09c1527...4add5b5 main -> main (forced update)
```

Phase 1 commit に固有のファイルは無いことを `git ls-tree` の diff で事前確認（損失ゼロ）。

### Step 3: 作業拠点の移行 (WSL → worktree → D:\projects\meal-planner)

複数環境からの誤上書きを根本的に防ぐため、作業拠点を **`D:\projects\meal-planner\`** に一本化。

経緯:
- 当初: worktree 内クローン (`D:\ClaudeCode_project\.claude\worktrees\<name>\meal-planner`) を試したが、worktree のライフサイクルに紐づくリスク + 別 repo (push-to-talk) の中に間借りする構造で不健全
- 最終形: `D:\projects\meal-planner` に top-level で配置。worktree から `mv` で移動（`node_modules` 含めて 411 packages、Windows ネイティブなので問題なく動作）

### Step 4: メモリ・lessons 体系の整備

- [`project_meal_planner.md`](C:\Users\sakur\.claude\projects\D--ClaudeCode-project\memory\project_meal_planner.md) — 作業拠点を `D:\projects\meal-planner` に更新、force-push 事故の経緯を追記、マイグレーション 004 適用済み記載
- [`feedback_multi_pc_git_workflow.md`](C:\Users\sakur\.claude\projects\D--ClaudeCode-project\memory\feedback_multi_pc_git_workflow.md) — 新規。複数 PC 運用ルール（`git init` 禁止、`git clone` 必須、canonical 1 箇所）
- [`reference_lessons_index.md`](C:\Users\sakur\.claude\projects\D--ClaudeCode-project\memory\reference_lessons_index.md) — 新規。インシデント集積場所へのリファレンス
- [`D:\ClaudeCode_project\lessons\INDEX.md`](D:\ClaudeCode_project\lessons\INDEX.md) — 新規。インシデント時系列インデックス
- [`D:\ClaudeCode_project\lessons\2026-05-19_meal-planner-force-push-overwrite.md`](D:\ClaudeCode_project\lessons\2026-05-19_meal-planner-force-push-overwrite.md) — 新規。今回の事故の蒸留版
- [`D:\ClaudeCode_project\meal-planner_force-push復旧と作業拠点移行.md`](D:\ClaudeCode_project\meal-planner_force-push復旧と作業拠点移行.md) — 新規。フルセッションナラティブ

---

## 詰まったポイント

### 「ファイルが消えちゃってる」報告

セッション中盤で「ファイルが開けない」とユーザー報告。当初は Supabase SQL を Windows 側 `D:\ClaudeCode_project\meal-planner-migrations\` にコピーしていたが、Claude Code が worktree 内スコープで動いていたため UI から開けなかった。worktree 内に置き直して解決 → 後に `D:\projects\meal-planner\` に一本化。

### Junction が UNC パスに非対応

worktree から WSL ~/meal-planner にシンボリックリンクを張ろうとしたが:
- Windows ジャンクション (`mklink /J`) は `Local volumes are required` で UNC 拒否
- 通常のシンボリックリンク (`mklink /D`) は管理者権限 or 開発者モード必須、どちらも無し

最終的に clone + mv で対応。リンクは諦め。

### GitHub Events API の `forced` フラグの罠

事故 push の Events API レスポンスが `forced=false` だったため、当初「ほんとに force push なのか？」が分かりにくかった。共通祖先ゼロの orphan history 差し替えでも `forced=false` が返るケースがあると判明。**コミット履歴の共通祖先有無で判断する**ほうが信頼できる。

---

## 現在の状態

```
拠点:               D:\projects\meal-planner\ (Windows ネイティブ)
GitHub:             https://github.com/shiki-ai-works/meal-planner
最新ローカル HEAD:  4add5b5 (Phase 2 PROGRESS_07)
GitHub origin/main: 4add5b5 (復旧済み)
保全タグ:           phase1-overwritten-backup → 09c1527 (GitHub に push 済み)
WSL ~/meal-planner: 凍結バックアップ (今後 git push/pull しない)
node_modules:       Windows ネイティブで再構築済み (411 packages)
TypeScript check:   クリーン
```

### マイグレーション適用状況

- ✅ 001 / 002 / 003 (過去セッションで適用済み)
- ✅ **004_user_targets.sql** — 2026-05-21 適用済み (このセッション)
- ⏳ **005_detailed_recipes.sql** — 未適用。次セッションで適用予定
- ⏳ **006_detailed_existing_recipes.sql** — 未適用。次セッションで適用予定

---

## 次にやること

次セッションは **`D:\projects\meal-planner` で Claude Code を起動して**開始。

1. **005 適用** — 新規タブで `supabase/migrations/005_detailed_recipes.sql` を Supabase SQL Editor に貼り付け → Run → `select count(*) from public.recipes` が 35 件になることを確認
2. **006 適用** — 同様に `006_detailed_existing_recipes.sql`。`select name, jsonb_array_length(steps) from public.recipes where name in ('豚汁','ハンバーグ')` で 7-10 ステップを確認
3. **動作確認**
   - 設定ページで目標カロリー/PFC が保存・読み込み・バリデーションが効くか
   - レシピ詳細 (`/recipes/[id]`) で 35 件全部が手順表示できるか
   - ダッシュボードの栄養グラフが目標値で色分けされるか
4. **未着手機能**
   - 常備品テンプレート (`pantry_templates`)
   - 消費判定の手動オーバーライド（外食スキップ UI）
   - レシピ画像対応 (`recipe.image_urls`)

---

## 教訓 (このセッションで学んだこと)

1. **新規 PC では必ず `git clone` から開始**。`git init` で始めると orphan history で既存リモートを破壊する可能性
2. **1 プロジェクト = 1 top-level フォルダ**。worktree や他 repo の中にネストすると後で混乱・事故の原因
3. **force push は必ずタグ保全 + `--force-with-lease=<branch>:<expected-sha>`**。裸の `--force` 禁止
4. **Supabase SQL Editor は 1 タブ 1 マイグレーション**。既存タブに追記しない、`$0` 等のスニペット残置に注意
5. **ローカル 1 つに見えても、別 PC・別環境・WSL/Windows それぞれが独立した「ローカル」**。canonical を 1 箇所に決めて他は触らない / 凍結する
6. **GitHub Events API の `forced` フラグは万能ではない**。共通祖先有無で判断するほうが信頼できる

---

## 注意点・引き継ぎ事項

- ローカル WSL ~/meal-planner は**凍結バックアップ**。`git pull` も `git push` もしない。万一 `D:\projects\meal-planner` が消えた場合の保険として残置
- GitHub タグ `phase1-overwritten-backup` (= 09c1527) は当面残す。事故時の根本原因コミットの保全用
- WSL2 と Windows の `node_modules` は**バイナリ非互換**。WSL2 から Windows にコピーしただけでは動かないので、`npm install` で再構築必要
- 今セッションは push-to-talk 用 worktree (`D:\ClaudeCode_project\.claude\worktrees\amazing-mccarthy-ef3284`) で動いていたため、 `D:\projects\meal-planner` への UI アクセスができない。**次セッションは必ず `D:\projects\meal-planner` を working directory にして起動**
- `lessons\` フォルダができたので、今後のミス・トラブルは `D:\ClaudeCode_project\lessons\YYYY-MM-DD_<slug>.md` に追加して INDEX.md を更新する運用に
