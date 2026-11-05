-- Allow one explicitly approved Gmail account in addition to company domains.

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
        lower(split_part(coalesce(users.email, ''), '@', 2)) in (
          'gadgeon.com',
          'webcardio.com'
        )
        or lower(coalesce(users.email, '')) = 'manafcjgennew@gmail.com'
      )
  );
$$;

revoke all on function public.is_authorized_captains_viewer() from public;
grant execute on function public.is_authorized_captains_viewer() to authenticated;
