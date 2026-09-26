-- Price grid 2026-09: way to pay (m12 / year / flex) and end of the 12-month commitment.
alter table leads add column if not exists term text;
alter table leads add column if not exists commitment_until timestamptz;
