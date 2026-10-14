-- Run this entire file in Supabase Dashboard → SQL Editor → New query.
-- TMDB movie and TV IDs are separate number spaces, so a saved title is identified by (media_type, id).
-- It is safe to run again. Existing rows are all movies and get media_type = 'movie'.

alter table public.saved_movies
  add column if not exists media_type text not null default 'movie';

alter table public.saved_movies
  drop constraint if exists saved_movies_media_type_check;
alter table public.saved_movies
  add constraint saved_movies_media_type_check check (media_type in ('movie', 'tv'));

alter table public.saved_movies
  drop constraint if exists saved_movies_user_tmdb_unique;
alter table public.saved_movies
  add constraint saved_movies_user_tmdb_unique unique (user_id, media_type, tmdb_movie_id);
