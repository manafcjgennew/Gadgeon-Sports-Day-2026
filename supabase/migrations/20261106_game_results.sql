create table if not exists public.sports_day_game_results (
  game_name text primary key,
  winner_name text,
  winner_team_name text,
  winner_business_unit text,
  runner_up_name text,
  runner_up_team_name text,
  runner_up_business_unit text,
  updated_at timestamptz not null default now()
);

alter table public.sports_day_game_results enable row level security;

drop policy if exists "Public can read game results" on public.sports_day_game_results;
create policy "Public can read game results"
  on public.sports_day_game_results
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage game results" on public.sports_day_game_results;
create policy "Admins can manage game results"
  on public.sports_day_game_results
  for all
  to authenticated
  using (public.is_sports_day_admin())
  with check (public.is_sports_day_admin());

revoke all on table public.sports_day_game_results from anon, authenticated;
grant select on table public.sports_day_game_results to anon, authenticated;
grant insert, update, delete on table public.sports_day_game_results to authenticated;
