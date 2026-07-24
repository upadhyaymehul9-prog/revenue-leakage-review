-- Leads captured by the revenue-leakage self-audit email gate.
create table if not exists public.revenue_leakage_leads (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  name               text not null,
  hospital_name      text not null,
  email              text not null,
  phone              text,
  readiness_score    integer,
  readiness_band     text,
  estimated_loss_min numeric,
  estimated_loss_max numeric,
  answered_count     integer,
  total_count        integer
);

-- RLS on. The public (anon) client may INSERT leads but may NOT read,
-- update, or delete them. Reads happen from the dashboard / a service-role backend.
alter table public.revenue_leakage_leads enable row level security;

create policy "public can insert revenue leakage leads"
  on public.revenue_leakage_leads
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT/UPDATE/DELETE policy is defined, so RLS denies those to anon by default.
