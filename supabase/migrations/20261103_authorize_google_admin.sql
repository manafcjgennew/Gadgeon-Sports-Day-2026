insert into public.admin_users (user_id)
select users.id
from auth.users users
where lower(users.email) = lower('manafcjgennew@gmail.com')
on conflict (user_id) do nothing;
