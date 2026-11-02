create table if not exists public.sports_day_teams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  points integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.sports_day_teams (name, points)
values
  ('Avial Avengers', 0),
  ('Thumbapoo Squad', 0),
  ('Sharkara Upperi Syndicate', 0),
  ('Prakmbanam', 0)
on conflict (name) do nothing;

alter table public.sports_day_teams enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_sports_day_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_sports_day_admin() from public;
grant execute on function public.is_sports_day_admin() to authenticated;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('sports_day_teams', 'admin_users')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end
$$;

create policy "Public can read team leaderboard"
  on public.sports_day_teams
  for select
  to anon, authenticated
  using (true);

create policy "Only admins can update team points"
  on public.sports_day_teams
  for update
  to authenticated
  using (public.is_sports_day_admin())
  with check (public.is_sports_day_admin() and points >= 0);

revoke all on table public.admin_users from anon, authenticated;
revoke insert, update, delete on table public.sports_day_teams from anon, authenticated;
grant select on table public.sports_day_teams to anon, authenticated;
grant update (points, updated_at) on table public.sports_day_teams to authenticated;
