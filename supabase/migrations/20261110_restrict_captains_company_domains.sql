-- Restrict captain details to the two approved company Google Workspace domains.
-- This policy also removes the previous Gmail allowlist exceptions.

delete from public.captains_access_users
where lower(email) in (
  'manafcjgennew@gmail.com',
  'amal.ms@gadgeon.com',
  'liya.shadimon@gadgeon.com',
  'muralikrishna.bs@gadgeon.com',
  'chinchu.venugopal@gadgeon.com',
  'anooja.saniyan@gadgeon.com',
  'ansil.rasheen@gadgeon.com'
);

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
      and lower(split_part(coalesce(users.email, ''), '@', 2)) in (
        'gadgeon.com',
        'webcardio.com'
      )
      or (
        users.id = auth.uid()
        and lower(coalesce(users.email, '')) = 'manafcjgennew@gmail.com'
      )
  );
$$;

revoke all on function public.is_authorized_captains_viewer() from public;
grant execute on function public.is_authorized_captains_viewer() to authenticated;
