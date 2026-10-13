# Reel Good — Movie Roulette & Binge Generator

A React and Vite movie discovery app. Choose a mood to discover a film without creating an account. Sign in to save movies to your Binge List.

## Setup

1. Install Node.js 20.19+ or 22.12+ and run `npm install`.
2. Copy `.env.example` to `.env` and fill in the variables:

   ```env
   TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
   ```

   `TMDB_ACCESS_TOKEN` has no `VITE_` prefix on purpose: it is only read by the serverless function in [`api/tmdb.js`](api/tmdb.js), so it never ends up in the browser bundle. The app calls `/api/tmdb`, which forwards allowed requests to TMDB with the token.

   Supabase values are optional for discovery, but required for accounts and saved movies. Only use the Supabase publishable/anon key in this client app. Never put a service-role or secret key in a `VITE_` variable or commit credentials.

3. In the Supabase Dashboard, open **SQL Editor → New query**, paste the complete contents of [`supabase/migrations/202610130001_movie_lists.sql`](supabase/migrations/202610130001_movie_lists.sql), and click **Run**. This creates `profiles` and `saved_movies`, the signup profile trigger, indexes, and row-level security policies. Each policy scopes records to `auth.uid()`; saved movie IDs are unique per user.
4. In Supabase **Authentication → URL Configuration**, set your local site URL (usually `http://localhost:5173`) and include it in allowed redirect URLs. Set email confirmation preferences as desired.
5. Run `npm run dev`. The Vite config runs the `/api/tmdb` function locally, so no Vercel CLI is needed (`vercel dev` also works). Restart after changing `.env`.

## Deploying to Vercel

In **Project → Settings → Environment Variables**, add `TMDB_ACCESS_TOKEN` (mark it Sensitive), `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy. Do not add a `VITE_TMDB_ACCESS_TOKEN` variable: anything prefixed with `VITE_` is published in the client JavaScript.

## SQL Editor instructions

The migration file is the complete SQL script. In the dashboard select the project, open **SQL Editor**, choose **New query**, paste the full file, and run it. A successful run adds:

- `public.profiles` keyed to `auth.users.id` (UUID), with email and created/updated timestamps; a trigger creates/updates profiles when auth users are created or change email.
- `public.saved_movies` with UUID row ID, user UUID, TMDB movie ID, title, poster path, watched state, and created/updated timestamps.
- RLS policies for select/insert/update/delete that require the authenticated user ID to match the row owner. The unique `(user_id, tmdb_movie_id)` constraint prevents duplicate saves.

No service-role key is needed. The browser uses the publishable/anon key; RLS is the data access boundary.

## Scripts

- `npm run dev` — start the local development server (including the `/api/tmdb` function)
- `npm run build` — create a production build in `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
