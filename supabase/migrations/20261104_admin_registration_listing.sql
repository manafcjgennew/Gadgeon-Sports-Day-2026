create or replace function public.list_sports_day_registrations()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select jsonb_agg(to_jsonb(registration))
      from public.sports_day_registrations registration
      where exists (
        select 1
        from public.admin_users
        where user_id = auth.uid()
      )
    ),
    '[]'::jsonb
  );
$$;

revoke all on function public.list_sports_day_registrations() from public;
grant execute on function public.list_sports_day_registrations() to authenticated;
