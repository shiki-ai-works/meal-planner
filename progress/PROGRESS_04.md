# 超献立プランナー 開発進捗 #04

> **作業環境を WSL2 に切替** — 2026-05-18

## このセッションでやったこと

### 経緯
- PROGRESS_01_2 では WSL2 (`~/meal-planner`) で開発する方針だったが、PROGRESS_02 の GitHub 連携で Windows 側 (`D:\ClaudeCode_project\meal-planner`) を git リポジトリ化してしまっていた
- PROGRESS_03 までは Windows 側で実装し commit は未実施
- 「他のユーザーに公開する本番は Linux」という話題から「本番(Vercel)とローカル開発環境は独立」を確認した上で、本番との近さ・hot reload の安定性・unix tooling を理由に **WSL2 へ一本化** することにした

### 実行ステップ
1. ✅ Windows dev server 停止
2. ✅ WSL2 側 `~/meal-planner` を `~/meal-planner.backup` にバックアップ
3. ✅ WSL2 で private リポジトリを clone
   - 1回目は認証プロンプト待ちでハング → Microsoft 推奨方式に切替
   - `git config --global credential.helper '/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe'` を WSL2 に設定
   - 既に Windows 側で gh 認証済 (PROGRESS_02) の資格情報を WSL2 から再利用できるようになった
   - 2回目の clone 成功
4. ✅ バックアップから `.env.local` を新クローンへコピー（本物の Supabase URL/anon key 保持）
5. ✅ 今セッションの 12 ファイルを `/mnt/d/.../meal-planner` から `~/meal-planner` にコピー
   - `cp -r` で Windows 側のフルパスから WSL2 ホームへ
   - 一時スクリプト `D:/ClaudeCode_project/copy-to-wsl.sh` を作成し `cat ... | wsl bash` で実行
     （Git Bash on Windows の `/mnt/d` パス変換問題を回避するため）
6. ✅ WSL2 で `npm install` 成功 (exit 0)
7. ⏸ git commit + push は **未実施** （ユーザー操作で中断）

### git 認証メモ
- WSL2 の git 操作で `https://github.com/...` を使うと、Windows の Git Credential Manager が呼び出され、Windows credential store に保存済みのトークンを共有
- 以後 WSL2 から `git push` 等はパスワード入力不要
- これは Microsoft 公式の推奨パターン (WSL の git は Windows credential manager を helper にする)

## 現在の状態


```
主作業ディレクトリ: WSL2 ~/meal-planner (= //wsl$/Ubuntu/home/sakur/meal-planner)
旧 (今後使わない): D:\ClaudeCode_project\meal-planner (ファイル自体は残っている)
バックアップ:       WSL2 ~/meal-planner.backup (動作確認後に削除予定)
```


WSL2 側 `git status --short` (PROGRESS_04 作成前):
```
 M src/app/(main)/dashboard/page.tsx
?? progress/PROGRESS_03.md
?? src/app/(main)/dashboard/WeekCalendar.tsx
?? src/app/api/
?? src/components/
?? src/lib/meal-generator/
?? src/lib/personas/
```

## 次にやること

1. **Step 7: commit + push を実行**（このファイル PROGRESS_04.md も WSL2 側に転送後、一緒に commit する）
2. **Step 8: 動作確認** WSL2 で dev server 起動 → ブラウザで `localhost:3000` テスト
3. **Step 9: `~/meal-planner.backup` 削除** （動作確認 OK 後）
4. Windows 側 `D:\ClaudeCode_project\meal-planner` の扱いを決める（削除 / 残す）
5. 機能開発の続き（PROGRESS_03 の「次にやること」参照）

## 注意点

- Windows と WSL2 の **二重管理は今後しない** （混乱の元）
- WSL2 から dev server 起動は `cd ~/meal-planner && npm run dev`、ブラウザは Windows から `localhost:3000` でアクセス可
- WSL2 のメモリ上にあるファイルを Windows のエディタで編集する場合は `\\wsl$\Ubuntu\home\sakur\meal-planner` 経由
- `MEMORY.md` の `project_meal_planner` は「WSL2」と記載済みで、今回これと実態が一致した
