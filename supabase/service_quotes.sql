-- Service quotes inbox (safe to run)
create table if not exists public.service_quotes (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  phone text,
  email text not null,

  service_type text not null,
  description text not null,

  status text not null default 'New', -- New | Quoted | Scheduled | In Progress | Complete | Closed
  internal_notes text
);

create index if not exists service_quotes_created_at_idx
  on public.service_quotes (created_at desc);

create index if not exists service_quotes_status_idx
  on public.service_quotes (status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname='service_quotes_set_updated_at') then
    create trigger service_quotes_set_updated_at
    before update on public.service_quotes
    for each row execute procedure public.set_updated_at();
  end if;
end $$;
