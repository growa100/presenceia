-- Run this in: https://supabase.com/dashboard/project/nsfbosmbyfpszwpqmcyo/sql/new

create table if not exists visibility_checks (
  id uuid default gen_random_uuid() primary key,
  cache_key text not null,
  business_name text not null,
  city text not null,
  category text not null,
  language text not null default 'fr',
  email text,
  overall_score integer not null,
  grade text not null,
  result jsonb not null,
  ip_hash text,
  created_at timestamptz default now()
);
create index if not exists idx_visibility_cache_key on visibility_checks(cache_key);
create index if not exists idx_visibility_created_at on visibility_checks(created_at);

create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  business_name text,
  city text,
  category text,
  score integer,
  grade text,
  language text,
  source text default 'visibility_checker',
  contacted boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_leads_email on leads(email);
create index if not exists idx_leads_score on leads(score);

-- Disable RLS for now (enable after testing)
alter table visibility_checks disable row level security;
alter table leads disable row level security;
