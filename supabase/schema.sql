-- =====================================================================
-- 世界の窓 (Sekai no Mado) — Supabase schema
-- Supabase ダッシュボードの SQL Editor に貼り付けて実行してください。
-- =====================================================================

-- 拡張（UUID生成用）
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- users : 匿名ユーザー（プロフィールなし）
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id           uuid primary key default gen_random_uuid(),
  anonymous_id text not null unique,
  country      text not null default 'UN',     -- ISO 3166-1 alpha-2
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- posts : 1日1枚の投稿（カメラ撮影のみ）
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  image_url         text not null,
  comment           text not null default '' check (char_length(comment) <= 50),
  country           text not null default 'UN',
  local_time        text not null default '',  -- "HH:mm"
  created_at        timestamptz not null default now(),
  is_visible        boolean not null default true,
  moderation_status text not null default 'approved'
                    check (moderation_status in ('approved', 'pending', 'rejected'))
);
-- 注: 漂流瓶への「写真返信」は専用列を持たず、bottle_matches.reply_post_id
--     から判定する（世界の窓・漂流プールの対象外にするため）。

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_visible_idx on public.posts (is_visible, moderation_status, created_at desc);

-- ---------------------------------------------------------------------
-- bottle_matches : 漂流瓶（送信者→受信者、1往復のみ）
-- ---------------------------------------------------------------------
create table if not exists public.bottle_matches (
  id               uuid primary key default gen_random_uuid(),
  sender_user_id   uuid not null references public.users(id) on delete cascade,
  receiver_user_id uuid not null references public.users(id) on delete cascade,
  post_id          uuid not null references public.posts(id) on delete cascade,
  reply_post_id    uuid references public.posts(id) on delete set null,
  reply_reaction   text,  -- リアクションで返した場合のキー（写真返信なら null）
  status           text not null default 'delivered'
                   check (status in ('delivered', 'replied', 'closed')),
  created_at       timestamptz not null default now()
);

create index if not exists bottle_receiver_idx on public.bottle_matches (receiver_user_id, created_at desc);

-- ---------------------------------------------------------------------
-- reports : 通報（通報された投稿は非表示にできる設計）
-- ---------------------------------------------------------------------
create table if not exists public.reports (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.posts(id) on delete cascade,
  reporter_user_id  uuid not null references public.users(id) on delete cascade,
  reason            text not null default '',
  created_at        timestamptz not null default now()
);

-- 1日1枚制限（同一ユーザーが同じ日付に1件のみ）。
-- ※ 漂流瓶への返信は reply_post_id 側で管理し、ここでは通常投稿のみを想定。
--    厳密なサーバ側制限が必要なら以下を有効化してください（UTC基準）。
-- create unique index if not exists posts_one_per_day_idx
--   on public.posts (user_id, (created_at::date));

-- =====================================================================
-- Storage バケット
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- =====================================================================
-- Row Level Security (RLS)
-- MVP向け: anon キーで読み書きできる最小ポリシー。
-- 本番では auth と組み合わせ、より厳密に絞ってください。
-- =====================================================================
alter table public.users         enable row level security;
alter table public.posts         enable row level security;
alter table public.bottle_matches enable row level security;
alter table public.reports       enable row level security;

-- users
drop policy if exists users_select on public.users;
create policy users_select on public.users for select using (true);
drop policy if exists users_insert on public.users;
create policy users_insert on public.users for insert with check (true);

-- posts : 表示は「可視 & 承認済み」のみ全公開、作成は誰でも、更新（通報での非表示）も許可
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select
  using (is_visible = true and moderation_status = 'approved');
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (true);
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update using (true) with check (true);

-- bottle_matches
drop policy if exists matches_all on public.bottle_matches;
create policy matches_all on public.bottle_matches for all using (true) with check (true);
drop policy if exists matches_update on public.bottle_matches;
create policy matches_update on public.bottle_matches for update using (true) with check (true);

-- reports
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (true);

-- storage: photos バケットへの公開読み取り & アップロード許可
drop policy if exists photos_read on storage.objects;
create policy photos_read on storage.objects for select
  using (bucket_id = 'photos');
drop policy if exists photos_insert on storage.objects;
create policy photos_insert on storage.objects for insert
  with check (bucket_id = 'photos');
