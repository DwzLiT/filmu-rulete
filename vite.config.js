import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Runs the Vercel function in api/tmdb.js under `npm run dev`, so local dev works without `vercel dev`.
function tmdbApiDev() {
  return {
    name: 'tmdb-api-dev',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      process.env.TMDB_ACCESS_TOKEN ??= env.TMDB_ACCESS_TOKEN

      server.middlewares.use('/api/tmdb', async (req, res) => {
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
        await handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tmdbApiDev()],
})
