-- Starter table for Ferguson Firearms purchase request inbox
-- NOTE:
-- If you created purchase_requests on an earlier version and you’re seeing
-- “column purchase_requests.updated_at does not exist”, run the migration lines
-- near the bottom of this file (ALTER TABLE … ADD COLUMN …).
-- The site will work without updated_at after v49, but adding it is recommended.
-- Run this in Supabase SQL editor (or via migrations)

create table if not exists public.purchase_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  phone text,
  email text not null,

  firearm text not null,
  source text,
  receiving_ffl text not null,
  notes text,

  status text not null default 'New', -- New | Quoted | Ordered | Ready | Complete | Closed
  internal_notes text,              -- admin-only notes

  user_agent text,
  ip text
);

-- Optional indexes
create index if not exists purchase_requests_created_at_idx
  on public.purchase_requests (created_at desc);

create index if not exists purchase_requests_status_idx
  on public.purchase_requests (status);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists purchase_requests_set_updated_at on public.purchase_requests;
create trigger purchase_requests_set_updated_at
before update on public.purchase_requests
for each row execute procedure public.set_updated_at();

-- If you already created the table on an earlier version, run these as a migration:
-- alter table public.purchase_requests add column if not exists updated_at timestamptz not null default now();
-- alter table public.purchase_requests add column if not exists internal_notes text;
-- alter table public.purchase_requests alter column status set default 'New';
