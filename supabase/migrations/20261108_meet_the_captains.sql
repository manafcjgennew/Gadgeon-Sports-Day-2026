create table if not exists public.captains_access_users (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.captains_access_users (email)
values ('manafcjgennew@gmail.com')
on conflict (email) do nothing;

create table if not exists public.sports_day_captains (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.sports_day_teams(id) on delete cascade,
  role text not null check (role in ('captain', 'vice_captain')),
  name text,
  email text,
  phone text,
  image_url text,
  updated_at timestamptz not null default now(),
  unique (team_id, role)
);

alter table public.captains_access_users enable row level security;
alter table public.sports_day_captains enable row level security;

create or replace function public.is_authorized_captains_viewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users users
    where users.id = auth.uid()
      and (
        lower(coalesce(users.email, '')) like '%@gadgeon.com'
        or exists (
          select 1
          from public.captains_access_users allowed
          where lower(allowed.email) = lower(users.email)
        )
      )
  );
$$;

revoke all on function public.is_authorized_captains_viewer() from public;
grant execute on function public.is_authorized_captains_viewer() to authenticated;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('sports_day_captains', 'captains_access_users')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end
$$;

create policy "Authorized users can read captain details"
  on public.sports_day_captains
  for select
  to authenticated
  using (public.is_authorized_captains_viewer());

create policy "Admins can insert captain details"
  on public.sports_day_captains
  for insert
  to authenticated
  with check (public.is_sports_day_admin());

create policy "Admins can update captain details"
  on public.sports_day_captains
  for update
  to authenticated
  using (public.is_sports_day_admin())
  with check (public.is_sports_day_admin());

create policy "Admins can delete captain details"
  on public.sports_day_captains
  for delete
  to authenticated
  using (public.is_sports_day_admin());

revoke all on table public.sports_day_captains from anon, authenticated;
grant select on table public.sports_day_captains to authenticated;
grant insert, update, delete on table public.sports_day_captains to authenticated;

revoke all on table public.captains_access_users from anon, authenticated;
