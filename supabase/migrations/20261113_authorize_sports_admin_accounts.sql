-- Grant Sports Day admin access to the approved Google accounts.

insert into public.admin_users (user_id)
select users.id
from auth.users users
where lower(coalesce(users.email, '')) in (
  'manafcjgennew@gmail.com',
  'sports@gadgeon.com',
  'abdul.manaf@gadgeon.com',
  'lal.john@gadgeon.com'
)
on conflict (user_id) do nothing;

create or replace function public.is_sports_day_admin()
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
      and lower(coalesce(users.email, '')) in (
        'manafcjgennew@gmail.com',
        'sports@gadgeon.com',
        'abdul.manaf@gadgeon.com',
        'lal.john@gadgeon.com'
      )
  );
$$;

revoke all on function public.is_sports_day_admin() from public;
grant execute on function public.is_sports_day_admin() to authenticated;
