// Requests go through our serverless proxy (api/tmdb.js), which holds the TMDB token.
async function tmdb(path, params) {
  const query = new URLSearchParams(params)
  query.set('path', path)
  const response = await fetch(`/api/tmdb?${query}`, { headers: { accept: 'application/json' } })
  if (!response.ok) {
    if (response.status === 401) throw new Error('TMDB could not verify the server token. Check TMDB_ACCESS_TOKEN in your environment variables.')
    const body = await response.json().catch(() => null)
    if (body?.error) throw new Error(body.error)
    throw new Error(`TMDB request failed (${response.status}). Please try again.`)
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The movie API is not running. Start the app with `npm run dev` or `vercel dev`.')
  }
  return response.json()
}

export async function discoverMovies(mood, count = 3) {
  const params = new URLSearchParams({
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    page: String(Math.floor(Math.random() * 10) + 1),
    'vote_average.gte': String(mood.rating),
    'vote_count.gte': String(mood.votes ?? 50),
  })
  if (mood.genre) params.set('with_genres', mood.genre)
  const type = mood.type ?? 'movie'
  const data = await tmdb(`discover/${type}`, params)
  const candidates = (data.results ?? []).filter((item) => item.title || item.name)
  if (!candidates.length) throw new Error('Nothing matched this mood on that page. Spin again for another batch.')
  // Shuffle, then take the first few so the picks are all different.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  return candidates.slice(0, count)
}

export async function getMovieDetails(id, type = 'movie') {
  const details = await tmdb(`${type}/${id}`, { language: 'en-US', append_to_response: 'videos' })
  if (type !== 'tv') return details
  // TV shows use different field names; map them onto the movie shape the UI expects.
  return { ...details, media_type: 'tv', title: details.name, release_date: details.first_air_date, runtime: details.episode_run_time?.[0] ?? details.last_episode_to_air?.runtime }
}

export function getTrailerUrl(movie) {
  const trailer = movie.videos?.results?.find((video) => video.site === 'YouTube' && video.type === 'Trailer')
    ?? movie.videos?.results?.find((video) => video.site === 'YouTube' && video.type === 'Teaser')
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : ''
}

export function getWatchUrl(movie) {
  const query = encodeURIComponent(`${movie.title ?? ''} ${movie.release_date?.slice(0, 4) ?? ''} where to watch`)
  return `https://www.google.com/search?q=${query}`
}
