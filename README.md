# Reel Good — Movie Roulette

A responsive movie discovery app built with React, Vite, JavaScript, and CSS. Pick a mood, spin the reels, and get a movie pick with its poster, rating, runtime, overview, trailer, and a link to find where it’s streaming.

## Get started

1. Install Node.js (20.19+ or 22.12+) and npm.
2. Create a free account at [TMDB](https://www.themoviedb.org/) and request an API Read Access Token in your account settings.
3. Copy `.env.example` to `.env` and add your token:

   ```env
   VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
   ```

   This is a Vite client-side app, so the token is included in browser requests. Use a restricted TMDB token and do not commit `.env`.

4. Install dependencies and start the development server:

   ```sh
   npm install
   npm run dev
   ```

   Restart the dev server after changing `.env`.

## Scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build in `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

Movie results come from TMDB’s discover endpoint, sorted by popularity and chosen at random from a randomly selected page (pages 1–10). Mood filters set genres, minimum ratings, and minimum vote counts. The “Where to watch” link opens a search because availability depends on location.
