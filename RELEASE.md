# 外部リリース手順（Supabase + Vercel）

「世界の窓」を本番公開するための手順です。
私（AI）の作業は **①GitHubリポジトリ作成・push・設定** まで完了しています。
残りは **Supabase の作成**と **Vercel との連携**で、どちらも Web 画面の操作です（あなたのアカウントが必要なため）。

所要時間: だいたい 15〜20 分。

---

## 全体像

```
[GitHub リポジトリ]  ←(済) コードはここに push 済み
        │ 連携
        ▼
   [Vercel]  ──ビルド/HTTPS配信──▶  https://<your-app>.vercel.app
        │ 環境変数で接続
        ▼
   [Supabase]  ──DB / 画像Storage──
```

> ポイント: Supabase の環境変数を入れる前でも、Vercel に出した時点で「ローカル・デモモード」として動きます（端末内のみ）。環境変数を入れて再デプロイすると、実際に世界で共有される本番モードに切り替わります。

---

## STEP 1. Supabase プロジェクト作成

1. <https://supabase.com> にログイン →「New project」
2. 任意の Project name（例: `sekai-no-mado`）/ リージョンは `Northeast Asia (Tokyo)` 推奨 / Database password を設定して作成
3. 数分待つとプロジェクトが起動

## STEP 2. テーブルと Storage を作成（SQL を実行するだけ）

1. 左メニュー **SQL Editor** →「New query」
2. リポジトリ内の **`supabase/schema.sql` の中身を全部コピペ** して **Run**
   - `users` / `posts` / `bottle_matches` / `reports` テーブル
   - `photos` Storage バケット
   - RLS ポリシー
   がまとめて作成されます（緑色の Success が出ればOK）

## STEP 3. 接続情報（キー）を取得

1. 左メニュー **Project Settings → API**
2. 次の 2 つを控える:
   - **Project URL**（`https://xxxx.supabase.co`）
   - **anon public** key（`eyJ...` で始まる長い文字列）

---

## STEP 4. Vercel でリポジトリを連携

1. <https://vercel.com> にログイン（GitHub アカウントでログインが楽）
2. **Add New… → Project**
3. GitHub の **`sekai-no-mado` リポジトリ** を **Import**
   - 初回は「Install Vercel for GitHub」で対象リポジトリへのアクセスを許可
4. 設定画面はそのままでOK（Framework は **Vite** が自動検出されます）

## STEP 5. 環境変数を設定

Import 画面の **Environment Variables** に、以下の 3 つを追加:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | STEP 3 の Project URL |
| `VITE_SUPABASE_ANON_KEY` | STEP 3 の anon public key |
| `VITE_SUPABASE_BUCKET` | `photos` |

> あとから追加・変更する場合: Vercel の Project → **Settings → Environment Variables**。
> 変更したら **Deployments → 最新 → Redeploy** で反映されます（環境変数はビルド時に埋め込まれるため、再デプロイが必要）。

## STEP 6. Deploy

- **Deploy** ボタンを押す → 1〜2 分で `https://<プロジェクト名>.vercel.app` が発行されます。

---

## STEP 7. 動作確認チェックリスト

公開URLをスマホ（iPhone Safari / Android Chrome）で開いて確認:

- [ ] ヘッダーに「ローカル・デモモード」が **出ていない**（＝Supabase 接続成功）
- [ ] 撮影ボタン → カメラが起動して撮影・投稿できる（HTTPSなのでカメラOK）
- [ ] 「世界の窓」に自分の投稿が出る／別端末からも同じ投稿が見える（＝共有できている）
- [ ] 1日1回の投稿制限がかかる
- [ ] 漂流瓶が届き、写真 or リアクションのどちらか一方で1回だけ返信できる
- [ ] 通報するとその投稿が非表示になる
- [ ] 共有メニューから「ホーム画面に追加」でアプリとして起動できる

> 「世界の窓」に何も出ない場合: まだ「今日」の投稿が誰もいない状態です。自分で1枚撮ると表示されます。別端末/別ブラウザでもう1アカウント作って試すと共有が確認できます。

---

## 既知の注意点（本番運用前に検討）

- **画像モデレーションは仮実装**（`src/lib/moderation.ts` が常に approved を返す）。一般公開で不適切投稿を防ぐには、Supabase Edge Function などでビジョンAIに接続してください。
- **通報は即時に該当投稿を `is_visible=false` にする**簡易仕様。悪用（嫌がらせ通報）対策が必要なら、サーバ側でしきい値判定に変更してください。
- **RLS は MVP 向けの緩いポリシー**（anon キーで読み書き可）。本格運用では Supabase Auth と組み合わせて絞ってください。
- 匿名IDは端末の localStorage に保存。ブラウザを変えると別ユーザー扱いになります。

---

## 更新フロー（公開後）

コードを直したら:

```powershell
git add -A
git commit -m "変更内容"
git push
```

push すると Vercel が自動で再ビルド＆再デプロイします。
