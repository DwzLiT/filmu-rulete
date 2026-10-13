// Server-side TMDB proxy: keeps the access token out of the browser bundle.
const API_ROOT = 'https://api.themoviedb.org/3'

// Only the endpoints the app actually uses, so the token can't be used for anything else.
const ALLOWED_PATHS = [/^discover\/movie$/, /^movie\/\d+$/]

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const token = process.env.TMDB_ACCESS_TOKEN?.trim()
  if (!token) return res.status(500).json({ error: 'TMDB_ACCESS_TOKEN is not configured on the server.' })

  const { path, ...params } = req.query
  if (typeof path !== 'string' || !ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
    return res.status(400).json({ error: 'Unsupported TMDB path.' })
  }

  const url = new URL(`${API_ROOT}/${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') url.searchParams.set(key, value)
  }

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
    })
    const data = await response.json()
    if (response.ok) res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(response.status).json(data)
  } catch {
    return res.status(502).json({ error: 'Could not reach TMDB.' })
  }
}
