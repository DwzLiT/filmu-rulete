import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)
let client

export function getSupabaseClient() {
  if (!isSupabaseConfigured) return null
  if (client) return client
  try {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    return client
  } catch (error) {
    throw new Error(error?.message || 'Supabase client could not be initialized.', { cause: error })
  }
}

export const supabase = isSupabaseConfigured ? getSupabaseClient() : null

export async function saveMovie(userId, movie) {
  const { data, error } = await getSupabaseClient().from('saved_movies').insert({
      user_id: userId,
      tmdb_movie_id: movie.id,
      title: movie.title || 'Untitled movie',
      poster_path: movie.poster_path || null,
    }).select('id').maybeSingle()
  if (error?.code === '23505') return null
  if (error) throw error
  return data
}

export async function listSavedMovies(userId) {
  const { data, error } = await getSupabaseClient()
    .from('saved_movies')
    .select('id, tmdb_movie_id, title, poster_path, watched, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function setMovieWatched(id, watched) {
  const { error } = await getSupabaseClient().from('saved_movies').update({ watched }).eq('id', id)
  if (error) throw error
}

export async function removeSavedMovie(id) {
  const { error } = await getSupabaseClient().from('saved_movies').delete().eq('id', id)
  if (error) throw error
}
