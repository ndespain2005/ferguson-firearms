-- Starter table for Ferguson Firearms purchase request inbox
-- Run this in Supabase SQL editor (or via migrations)

create table if not exists public.purchase_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text not null,
  firearm text not null,
  source text,
  receiving_ffl text not null,
  notes text,
  status text not null default 'new',
  user_agent text,
  ip text
);

-- Optional indexes
create index if not exists purchase_requests_created_at_idx
  on public.purchase_requests (created_at desc);

create index if not exists purchase_requests_status_idx
  on public.purchase_requests (status);
