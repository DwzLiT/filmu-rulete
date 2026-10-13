const API_ROOT = 'https://api.themoviedb.org/3'

function getToken() {
  return import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim()
}

async function tmdb(path) {
  const token = getToken()
  if (!token) throw new Error('Add your TMDB Read Access Token to .env to start discovering movies.')
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('TMDB could not verify that token. Check VITE_TMDB_ACCESS_TOKEN in your .env file.')
    throw new Error(`TMDB request failed (${response.status}). Please try again.`)
  }
  return response.json()
}

export async function discoverMovie(mood) {
  const params = new URLSearchParams({
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    page: String(Math.floor(Math.random() * 10) + 1),
    'vote_average.gte': String(mood.rating),
    'vote_count.gte': String(mood.votes ?? 50),
  })
  if (mood.genre) params.set('with_genres', mood.genre)
  const data = await tmdb(`/discover/movie?${params}`)
  const candidates = (data.results ?? []).filter((item) => item.title)
  if (!candidates.length) throw new Error('No movies matched this mood on that page. Spin again for another batch.')
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function getMovieDetails(id) {
  return tmdb(`/movie/${id}?language=en-US&append_to_response=videos`)
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
