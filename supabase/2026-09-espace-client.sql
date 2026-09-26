-- Espace client + Stripe (2026-09). Run once in the Supabase SQL editor. Safe to re-run.

-- 1. Analyses: rows served from the 7-day cache are stored for the client history but do not
--    count against the daily allowance or the API budget.
alter table visibility_checks add column if not exists from_cache boolean not null default false;
create index if not exists idx_visibility_email on visibility_checks(email, created_at desc);

-- 2. Client journey and subscription on the lead (one row per email).
alter table leads add column if not exists stage text default 'analysis';   -- analysis | audit_requested | audit_done | client | paused
alter table leads add column if not exists client_message text;             -- Antoine's current note, shown in the client space
alter table leads add column if not exists phone text;
alter table leads add column if not exists audit_requested_at timestamptz;
alter table leads add column if not exists audit_done_at timestamptz;
alter table leads add column if not exists plan text;                       -- site | visibility | complete
alter table leads add column if not exists subscription_status text;        -- active | trialing | past_due | canceled ...
alter table leads add column if not exists stripe_customer_id text;
alter table leads add column if not exists stripe_subscription_id text;
alter table leads add column if not exists current_period_end timestamptz;
alter table leads add column if not exists last_login_at timestamptz;
create index if not exists idx_leads_stripe_customer on leads(stripe_customer_id);

-- 3. Follow-up timeline shown in the client space. Antoine adds rows (Table editor) for each
--    step of the work; the site adds analysis, audit request and payment events itself.
create table if not exists client_updates (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  kind text not null default 'note',   -- note | audit | plan | work | report (monthly) | payment
  title text not null,
  body text,
  link text,
  created_at timestamptz default now()
);
create index if not exists idx_client_updates_email on client_updates(email, created_at desc);

alter table client_updates enable row level security;  -- server-only table (service role)
