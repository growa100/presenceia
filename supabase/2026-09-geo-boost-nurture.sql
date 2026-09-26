-- GEO Boost (one-time pack) + nurture emails + monthly re-test (2026-09). Safe to re-run.
alter table leads add column if not exists boost_paid_at timestamptz;
alter table leads add column if not exists nurture_step integer not null default 0;   -- 0 none, 1 J+2, 2 J+5, 3 J+10 sent
alter table leads add column if not exists nurture_last_at timestamptz;
alter table leads add column if not exists marketing_opt_out boolean not null default false;
alter table leads add column if not exists last_retest_at timestamptz;
-- 'user' = asked by the visitor (counts in the free daily allowance), 'retest' = our monthly re-check
alter table visibility_checks add column if not exists kind text not null default 'user';
