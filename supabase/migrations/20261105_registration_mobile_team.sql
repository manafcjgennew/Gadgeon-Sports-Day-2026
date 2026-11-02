alter table public.sports_day_registrations
  add column if not exists mobile_number text,
  add column if not exists team_name text;

update public.sports_day_registrations
set mobile_number = btrim(mobile_number),
    team_name = btrim(team_name)
where mobile_number is not null or team_name is not null;
