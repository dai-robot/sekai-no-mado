# 世界の窓 (Sekai no Mado)

> 今日の地球を、そっと覗くアプリ。

世界中の人が「今見ている景色」を **1日1枚だけ** 共有する PWA。
SNSではありません。フォロー・いいね・コメント欄・ランキングはありません。

- 🌐 **多言語対応（i18n）**: 日本語/英語/中文/한국어/Español/Français/Português/Deutsch を自動判定＋ヘッダーで切替
- 📷 **カメラ撮影のみ**（画像アップロード不可 / 自分の投稿は1日1回）
- 💬 ひとことコメント（50文字まで・通常投稿のみ）
- 🪟 **世界の窓**：今日投稿された写真だけを一覧表示
- 🍾 **漂流瓶**：1日にひとつ届く。返信は **写真** か **リアクション（いいね等）** の **どちらか一つだけ**（1往復のみ・**言葉は不可**）
- 🛡️ 投稿前 AI モデレーション（MVPは仮実装）＋通報で非表示
- 👤 匿名設計（投稿者名・プロフィール・いいね数・閲覧数なし）

---

## 技術構成

| 項目 | 採用 |
| --- | --- |
| フレームワーク | Vite + React 18 + TypeScript |
| PWA | `vite-plugin-pwa`（Service Worker / manifest / オフラインキャッシュ） |
| バックエンド | Supabase（未設定時は **localStorage のローカルモック**で動作） |
| デザイン | 手描き風・淡色・明朝体ベースのプレーンCSS |

> **ポイント**: Supabase を設定しなくても、ローカルモックでカメラ撮影〜投稿〜世界の窓〜漂流瓶まで一通り動きます（デモ用のシード投稿付き）。まず動かして雰囲気を確認できます。

---

## ファイル構成

```
messageinabottle/
├─ index.html                 # エントリ（PWAメタ / safe-area対応）
├─ package.json
├─ vite.config.ts             # Vite + PWA(manifest/SW) 設定
├─ tsconfig.json / tsconfig.node.json
├─ .env.example               # 環境変数テンプレート
├─ supabase/
│  └─ schema.sql              # テーブル定義 + RLS + Storage バケット
├─ public/
│  ├─ favicon.svg
│  └─ icons/
│     ├─ icon.svg             # PWAアイコン(any)
│     └─ icon-maskable.svg    # PWAアイコン(maskable)
└─ src/
   ├─ main.tsx
   ├─ App.tsx                 # タブ・撮影シート・トーストの司令塔
   ├─ index.css               # デザインシステム
   ├─ types.ts                # 型（users/posts/bottle_matches/reports）
   ├─ vite-env.d.ts
   ├─ lib/
   │  ├─ backend.ts           # バックエンド抽象（supabase / local を自動切替）
   │  ├─ supabaseBackend.ts   # Supabase 実装
   │  ├─ localBackend.ts      # localStorage モック（シード投稿あり）
   │  ├─ moderation.ts        # 仮のモデレーション関数
   │  ├─ country.ts           # 国コード推定 + 国旗絵文字
   │  └─ time.ts              # 現地時刻 / 「今日」判定
   └─ components/
      ├─ TabBar.tsx           # 「漂流瓶」「世界の窓」2タブ
      ├─ CameraCapture.tsx    # カメラ起動→撮影→ひとこと→送信
      ├─ WorldWindow.tsx      # 世界の窓（今日のみ）
      ├─ BottleTab.tsx        # 漂流瓶
      ├─ PostCard.tsx         # 写真/国旗/現地時刻/コメント + 通報
      └─ icons.tsx
```

---

## 起動方法

### 0. 前提：Node.js が必要

このプロジェクトのビルド/開発サーバには **Node.js（npm 同梱）** が必要です。
現在この PC には Node.js / npm が見当たりませんでした（Cursor 同梱の node のみ）。
[Node.js LTS](https://nodejs.org/ja) をインストールしてから、ターミナル（PowerShell）を開き直してください。

```powershell
node -v   # v20 以上を推奨
npm -v
```

### 1. 依存関係のインストール

```powershell
npm install
```

### 2. 開発サーバ起動（ローカルモードでそのまま動きます）

```powershell
npm run dev
```

ブラウザで表示される URL（既定 `http://localhost:5173`）を開きます。
**カメラはセキュアコンテキストが必要**です。`localhost` は OK。スマホ実機で試す場合は後述の HTTPS を参照。

### 3. ビルド / プレビュー

```powershell
npm run build
npm run preview
```

---

## 環境変数（Supabase を使う場合）

`.env.example` を `.env` にコピーして設定します。**未設定ならローカルモックで動作**します。

```
VITE_SUPABASE_URL=...        # Project Settings > API
VITE_SUPABASE_ANON_KEY=...   # anon public key
VITE_SUPABASE_BUCKET=photos  # 写真用 Storage バケット名
```

### Supabase セットアップ手順

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase/schema.sql` を実行（テーブル・RLS・`photos` バケットを作成）
3. **Project Settings > API** から URL と anon key を取得して `.env` に設定
4. `npm run dev` を再起動 → ヘッダーの「ローカル・デモモード」表示が消えれば Supabase 接続中

---

## スマホ実機 / ホーム画面追加（PWA）

- カメラ API は HTTPS（または localhost）でのみ動きます。実機で試すには:
  - 同一 LAN で `npm run dev -- --host` し、`https` トンネル（例: `cloudflared` / `ngrok`）経由で開く、もしくは
  - `npm run build` した `dist/` を HTTPS で配信する
- iOS Safari / Android Chrome で開き、共有メニューから **「ホーム画面に追加」**
- スタンドアロン表示・テーマカラー・アイコンは `vite.config.ts` の `manifest` で設定済み

---

## データモデル（Supabase）

`supabase/schema.sql` 参照。要点のみ:

- **users**: `id` / `anonymous_id` / `country` / `created_at`（プロフィールは持たない）
- **posts**: `image_url` / `comment(<=50)` / `country` / `local_time` / `is_visible` / `moderation_status`
- **bottle_matches**: `sender_user_id` / `receiver_user_id` / `post_id` / `reply_post_id`(写真返信) / `reply_reaction`(リアクション返信) / `status`（1往復のみ・1日ひとつ）
- **reports**: `post_id` / `reporter_user_id` / `reason`（通報で `posts.is_visible=false`）

---

## 設計上の約束（やらないこと）

実装していません（仕様どおり）:

- フォロー / いいね / コメント欄 / ランキング / 閲覧数
- 投稿者名・プロフィール画面・DM
- 本格的な Push 通知・AI翻訳・課金

## モデレーション拡張ポイント

`src/lib/moderation.ts` の `moderate()` が唯一の判定箇所です。
本番では、ここを Supabase Edge Function 経由でビジョンAI（不適切画像検出）に差し替えてください。
`rejected` を返すと投稿は保存されません。
```
