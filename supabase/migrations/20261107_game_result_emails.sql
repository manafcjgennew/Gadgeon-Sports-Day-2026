alter table public.sports_day_game_results
  add column if not exists winner_email text,
  add column if not exists runner_up_email text;
