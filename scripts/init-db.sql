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

-- ─── Users (clients + admins) ─────────────────────────────────────────────
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password_hash text,
  full_name text,
  role text not null default 'client', -- 'client' | 'admin'
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive', -- 'active' | 'inactive' | 'trialing' | 'canceled'
  plan text default 'starter', -- 'starter' | 'growth' | 'domination'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Client profiles (business info) ──────────────────────────────────────
create table if not exists client_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  business_name text not null,
  website_url text,
  city text,
  category text,
  languages text[] default array['fr'],
  sftp_host text,
  sftp_user text,
  sftp_password_encrypted text,
  sftp_path text default '/public_html',
  google_business_url text,
  target_keywords text[],
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Agent jobs ────────────────────────────────────────────────────────────
create table if not exists agent_jobs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references users(id) on delete cascade,
  job_type text not null, -- 'schema_gen' | 'content_write' | 'directory_submit' | 'ai_monitor' | 'report_gen'
  status text default 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  payload jsonb default '{}',
  result jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_agent_jobs_client on agent_jobs(client_id);
create index if not exists idx_agent_jobs_status on agent_jobs(status);

-- ─── GEO reports ──────────────────────────────────────────────────────────
create table if not exists geo_reports (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references users(id) on delete cascade,
  period text not null, -- '2026-05'
  overall_score integer,
  previous_score integer,
  grade text,
  platform_results jsonb,
  recommendations jsonb,
  share_of_voice integer,
  pdf_url text,
  created_at timestamptz default now()
);
create index if not exists idx_geo_reports_client on geo_reports(client_id);

-- ─── Blog posts ────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title_fr text, title_de text, title_en text,
  excerpt_fr text, excerpt_de text, excerpt_en text,
  content_fr text, content_de text, content_en text,
  author text default 'Équipe Présence IA',
  tags text[],
  published boolean default true,
  reading_time integer default 5,
  created_at timestamptz default now()
);

-- ─── RLS off for now ───────────────────────────────────────────────────────
alter table users disable row level security;
alter table client_profiles disable row level security;
alter table agent_jobs disable row level security;
alter table geo_reports disable row level security;
alter table blog_posts disable row level security;
