-- =====================================================================
-- マイグレーション 001: 漂流ボトル・プール方式への対応
--
-- すでに schema.sql を実行済みの Supabase プロジェクトに対して、
-- SQL Editor で一度だけ実行してください（新規作成なら schema.sql に含まれるため不要）。
--
-- 変更点:
--   posts.is_reply を追加。
--   「漂流瓶への写真返信」で作られる投稿を識別し、
--   世界の窓の一覧・漂流プールの配信対象から除外するために使う。
-- =====================================================================

alter table public.posts
  add column if not exists is_reply boolean not null default false;

create index if not exists posts_pool_idx
  on public.posts (is_reply, is_visible, moderation_status, created_at desc);
