import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Runs the Vercel function in api/tmdb.js under `npm run dev`, so local dev works without `vercel dev`.
function tmdbApiDev() {
  return {
    name: 'tmdb-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        // Read .env on every request so edits apply without a restart.
        const { TMDB_ACCESS_TOKEN } = loadEnv(server.config.mode, process.cwd(), '')
        const { default: handler } = await server.ssrLoadModule('/api/tmdb.js')
        const url = new URL(req.url, 'http://localhost')
        req.query = Object.fromEntries(url.searchParams)
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
          return res
        }
        await handler(req, res, TMDB_ACCESS_TOKEN)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tmdbApiDev()],
})
