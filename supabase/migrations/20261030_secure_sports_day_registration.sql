alter table public.sports_day_registrations enable row level security;

-- Remove policies that permit browser clients to insert registrations.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sports_day_registrations'
      and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.sports_day_registrations', policy_record.policyname);
  end loop;
end
$$;

-- Browser roles cannot insert directly. The Edge Function uses the service role.
revoke insert on table public.sports_day_registrations from anon;
revoke insert on table public.sports_day_registrations from authenticated;

-- Duplicate registrations are rejected by the same email/event combination.
create unique index if not exists sports_day_registration_unique
  on public.sports_day_registrations (email, event_name);

-- No public SELECT, UPDATE, or DELETE policies are created.
