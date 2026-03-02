-- Contact messages inbox (safe to run)
create table if not exists public.contact_messages (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  phone text,
  email text not null,
  topic text not null,
  message text not null,

  status text not null default 'New', -- New | In Progress | Closed
  internal_notes text
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname='contact_messages_set_updated_at') then
    create trigger contact_messages_set_updated_at
    before update on public.contact_messages
    for each row execute procedure public.set_updated_at();
  end if;
end $$;
