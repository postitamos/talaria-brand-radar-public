create extension if not exists pgcrypto;

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  name text not null,
  company text not null,
  role text not null,
  country text not null,
  marketing_consent boolean not null,
  source text not null default 'brand-radar-public',
  source_page text not null default 'registo',
  locale text not null default 'pt-PT',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists newsletter_signups_email_normalized_idx
  on public.newsletter_signups (email_normalized);

drop trigger if exists newsletter_signups_set_timestamp on public.newsletter_signups;
create trigger newsletter_signups_set_timestamp
before update on public.newsletter_signups
for each row
execute procedure public.set_timestamp();

alter table public.newsletter_signups enable row level security;
