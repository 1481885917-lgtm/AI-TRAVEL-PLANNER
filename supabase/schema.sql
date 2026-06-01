create extension if not exists "pgcrypto";

create table if not exists public.travel_plans (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  depart_date date not null,
  return_date date not null,
  travelers integer not null check (travelers > 0),
  total_budget numeric not null check (total_budget > 0),
  preferences text[] not null default '{}',
  plan jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists travel_plans_created_at_idx on public.travel_plans (created_at desc);
create index if not exists travel_plans_route_idx on public.travel_plans (origin, destination);
