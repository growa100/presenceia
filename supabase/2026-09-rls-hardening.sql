-- Hardening (recommended, run after checking): the site only talks to Supabase with the service
-- role key (server side), which bypasses RLS. Turning RLS on with no policy closes these tables
-- to the public anon key, which is otherwise able to read leads and analyses.
alter table leads enable row level security;
alter table visibility_checks enable row level security;
alter table users enable row level security;
alter table client_profiles enable row level security;
alter table agent_jobs enable row level security;
alter table geo_reports enable row level security;
