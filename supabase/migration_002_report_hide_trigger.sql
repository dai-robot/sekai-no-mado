-- 通報で投稿を確実に非表示にする（RLS の UPDATE 権限がなくても動く）
-- Supabase SQL Editor で実行してください。

create or replace function public.hide_post_on_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set is_visible = false
  where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists on_report_hide_post on public.reports;
create trigger on_report_hide_post
  after insert on public.reports
  for each row
  execute function public.hide_post_on_report();

-- 念のため（クライアント直接更新用）
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update using (true) with check (true);

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (true);
