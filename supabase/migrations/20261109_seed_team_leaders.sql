insert into public.sports_day_captains
  (team_id, role, name, image_url, updated_at)
select team.id, leader.role, leader.name, leader.image_url, now()
from public.sports_day_teams team
cross join lateral (
  values
    ('Avial Avengers', 'captain', 'Liya V S', '/images/captains/liya-v-s.png'),
    ('Avial Avengers', 'vice_captain', 'Ansil Rasheem M S', '/images/captains/ansil-rasheem-m-s.png'),
    ('Thumbapoo Squad', 'captain', 'Amal M S', '/images/captains/amal-m-s.png'),
    ('Thumbapoo Squad', 'vice_captain', 'Balabhaskar K H', '/images/captains/balabhaskar-k-h.png'),
    ('Sharkara Upperi Syndicate', 'captain', 'Muralikrishna B S', '/images/captains/muralikrishna-b-s.png'),
    ('Sharkara Upperi Syndicate', 'vice_captain', 'Chinchu Venugopal', '/images/captains/chinchu-venugopal.png'),
    ('Prakmbanam', 'captain', 'Greeshma Balakrishman', '/images/captains/greeshma-balakrishman.png'),
    ('Prakmbanam', 'vice_captain', 'Anooja S Aniyan', '/images/captains/anooja-s-aniyan.png')
) as leader(team_name, role, name, image_url)
where team.name = leader.team_name
on conflict (team_id, role) do update set
  name = excluded.name,
  image_url = excluded.image_url,
  updated_at = excluded.updated_at;
