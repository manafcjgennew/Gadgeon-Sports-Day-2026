-- Add the approved captain and vice-captain email addresses to the Supabase popup data.

update public.sports_day_captains leader
set email = addresses.email,
    updated_at = now()
from public.sports_day_teams team,
     lateral (
       values
         ('Avial Avengers', 'captain', 'liya.shadimon@gadgeon.com'),
         ('Avial Avengers', 'vice_captain', 'ansil.rasheen@gadgeon.com'),
         ('Thumbapoo Squad', 'captain', 'amal.ms@gadgeon.com'),
         ('Sharkara Upperi Syndicate', 'captain', 'muralikrishna.bs@gadgeon.com'),
         ('Sharkara Upperi Syndicate', 'vice_captain', 'chinchu.venugopal@gadgeon.com'),
         ('Prakmbanam', 'vice_captain', 'anooja.saniyan@gadgeon.com')
     ) as addresses(team_name, leader_role, email)
where team.id = leader.team_id
  and team.name = addresses.team_name
  and leader.role = addresses.leader_role;
