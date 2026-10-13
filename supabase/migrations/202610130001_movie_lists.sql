-- Run this entire file in Supabase Dashboard → SQL Editor → New query.
-- It is safe to run again: table/index/policies are recreated idempotently.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_movie_id bigint not null,
  title text not null,
  poster_path text,
  watched boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_movies_user_tmdb_unique unique (user_id, tmdb_movie_id)
);

create index if not exists saved_movies_user_created_idx
  on public.saved_movies (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_movies_set_updated_at on public.saved_movies;
create trigger saved_movies_set_updated_at
  before update on public.saved_movies
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email, updated_at = now();

alter table public.profiles enable row level security;
alter table public.saved_movies enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read own saved movies" on public.saved_movies;
create policy "Users can read own saved movies" on public.saved_movies
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can save own movies" on public.saved_movies;
create policy "Users can save own movies" on public.saved_movies
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own saved movies" on public.saved_movies;
create policy "Users can update own saved movies" on public.saved_movies
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can remove own saved movies" on public.saved_movies;
create policy "Users can remove own saved movies" on public.saved_movies
  for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_movies to authenticated;
