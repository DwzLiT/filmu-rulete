import { useEffect, useState } from 'react'
import { discoverMovies, getMovieDetails, getTrailerUrl, getWatchUrl } from './lib/tmdb.js'
import { isSupabaseConfigured, listSavedMovies, removeSavedMovie, saveMovie, setMovieWatched, supabase } from './lib/supabase.js'
import './App.css'

const moods = [
  { id: 'mind', title: 'Mind-bending Sci-Fi', icon: '✳', description: 'Reality is optional', genre: '878', rating: 7, color: 'violet' },
  { id: 'bad', title: "So Bad It's Good", icon: '☻', description: 'Beautifully terrible', rating: 4.5, votes: 100, color: 'lime' },
  { id: 'cry', title: 'Crying on the Couch', icon: '☂', description: 'Feel all the feelings', genre: '18,10749', rating: 7, color: 'blue' },
  { id: 'rush', title: 'Adrenaline Rush', icon: '↗', description: 'No time to blink', genre: '28,53', rating: 6.5, color: 'orange' },
  { id: 'scream', title: 'Sleep With the Lights On', icon: '☠', description: 'Screams guaranteed', genre: '27', rating: 6.5, color: 'red' },
  { id: 'binge', title: 'Just One More Episode', icon: '▣', description: 'Goodbye, weekend', type: 'tv', rating: 7.5, votes: 200, color: 'gold' },
  { id: 'doc', title: 'Wait, That Really Happened?', icon: '◉', description: 'Truth is stranger', genre: '99', rating: 7, color: 'teal' },
  { id: 'toon', title: 'Cartoons Are for Grown-ups', icon: '✿', description: 'Drawn to perfection', genre: '16', rating: 7, color: 'pink' },
]

function App() {
  const [mood, setMood] = useState(null)
  const [resultMood, setResultMood] = useState(null)
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(Boolean(supabase))
  const [authMode, setAuthMode] = useState('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authStatus, setAuthStatus] = useState('idle')
  const [authError, setAuthError] = useState('')
  const [savedMovies, setSavedMovies] = useState([])
  const [savedStatus, setSavedStatus] = useState('idle')
  const [savedError, setSavedError] = useState('')
  const [saveStatuses, setSaveStatuses] = useState({})
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => {
    if (!supabase) return undefined
    let alive = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return
      if (sessionError) setAuthError(sessionError.message)
      setSession(data?.session ?? null)
      setSessionLoading(false)
    }).catch((sessionError) => {
      if (!alive) return
      setAuthError(sessionError.message || 'Could not restore your session.')
      setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthError('')
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      queueMicrotask(() => { setSavedMovies([]); setSavedStatus('idle') })
      return undefined
    }
    let alive = true
    listSavedMovies(session.user.id).then((rows) => {
      if (alive) { setSavedMovies(rows); setSavedStatus('ready'); setSavedError('') }
    }).catch((err) => {
      if (alive) { setSavedError(err.message || 'Could not load your Binge List.'); setSavedStatus('error') }
    })
    return () => { alive = false }
  }, [session?.user])

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthStatus('loading')
    try {
      if (!supabase?.auth) {
        throw new Error('Authentication is unavailable. Check the Supabase URL and anon key.')
      }
      const credentials = { email: authEmail.trim(), password: authPassword }
      const { data, error: requestError } = authMode === 'signup'
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials)
      if (requestError) { setAuthError(requestError.message); return }
      if (authMode === 'signup' && !data.session) setAuthError('Check your email for a confirmation link, then log in.')
      setAuthPassword('')
    } catch (requestError) {
      setAuthError(requestError.message || 'Could not complete authentication.')
    } finally {
      setAuthStatus('idle')
    }
  }

  const logout = async () => {
    const { error: requestError } = await supabase.auth.signOut()
    if (requestError) setAuthError(requestError.message)
  }

  const addMovie = async (movie) => {
    if (!session?.user) return
    const setSaveStatus = (value) => setSaveStatuses((current) => ({ ...current, [movie.id]: value }))
    setSaveStatus('loading')
    setSavedError('')
    try {
      const inserted = await saveMovie(session.user.id, movie)
      setSavedMovies(await listSavedMovies(session.user.id))
      setSaveStatus('saved')
      setSavedNotice(inserted ? `Added ${movie.title} to your Binge List.` : `${movie.title} is already in your Binge List.`)
    } catch (err) { setSavedError(err.message || 'Could not save this movie.'); setSaveStatus('error') }
  }

  const updateSavedMovie = async (row, action) => {
    setSavedError('')
    try {
      if (action === 'remove') await removeSavedMovie(row.id)
      else await setMovieWatched(row.id, !row.watched)
      setSavedMovies(await listSavedMovies(session.user.id))
    } catch (err) { setSavedError(err.message || 'Could not update your Binge List.') }
  }
  const spin = async () => {
    if (!mood) return
    setStatus('loading')
    setError('')
    try {
      const picks = await discoverMovies(mood)
      setMovies([])
      setSaveStatuses({})
      setSavedNotice('')
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const details = await Promise.all(picks.map((pick) => getMovieDetails(pick.id, mood.type)))
      setMovies(details)
      setResultMood(mood)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="app-shell">
      <div className="mood-backdrop" aria-hidden="true">{moods.map((item) => <div key={item.id} className={`backdrop-${item.id} ${mood?.id === item.id ? 'active' : ''}`} />)}</div>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Reel Good home"><span className="brand-mark">r</span><span>reel<span className="brand-light">good</span></span></a>
        <nav aria-label="Main navigation"><a className="nav-active" href="#home">Discover</a><a href="#how-it-works">How it works</a></nav>
        {session?.user ? <div className="account-actions"><span>{session.user.email}</span><button type="button" onClick={logout}>Log out</button></div> : <a className="top-link" href="#account">Log in</a>}
        <a className="top-link" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">Powered by TMDB <span>↗</span></a>
      </header>

      <main id="home">
        <section className="hero">
          <div className="eyebrow"><span className="eyebrow-line" />YOUR NEXT FAVORITE IS OUT THERE</div>
          <h1>Less scrolling.<br /><span>More watching.</span></h1>
          <p>Tell us the vibe. We’ll find the movie.<br className="desktop-break" /> Your only job is to press play.</p>
        </section>

        <section className="discovery" aria-label="Choose your movie mood">
          <div className="section-heading"><div><span className="step">01</span><h2>Pick your mood</h2></div><span className="section-note">The couch is calling</span></div>
          <div className="mood-grid">
            {moods.map((item) => <button key={item.id} type="button" className={`mood-card ${item.color} ${mood?.id === item.id ? 'selected' : ''}`} onClick={() => setMood(mood?.id === item.id ? null : item)} aria-pressed={mood?.id === item.id}>
              <span className="mood-icon">{item.icon}</span><span className="mood-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="radio"><i /></span>
            </button>)}
          </div>

          <div className="spin-row"><span className="spin-caption"><span className="sparkle">✦</span> {mood ? 'Three picks. Zero decision fatigue.' : 'Pick a mood to start.'}</span><button className="spin-button" type="button" onClick={spin} disabled={!mood || status === 'loading'}><span>{status === 'loading' ? 'Finding your films' : movies.length ? 'Spin again' : 'Spin the wheel'}</span><span className={status === 'loading' ? 'button-icon spinning' : 'button-icon'}>✳</span></button></div>

          {status === 'loading' && <div className="roulette" role="status"><div className="loader-orbit"><span>✳</span></div><strong>Shuffling the reels…</strong><small>Finding your kind of movie magic</small></div>}
          {status === 'error' && <div className="notice error-notice" role="alert"><span>!</span><div><strong>We hit a snag.</strong><p>{error}</p></div><button type="button" onClick={spin}>Try again</button></div>}
          {status === 'ready' && movies.map((movie, index) => {
            const saveStatus = saveStatuses[movie.id]
            return <MovieCard key={movie.id} movie={movie} mood={resultMood} pick={index + 1} total={movies.length} onSave={() => addMovie(movie)} saveLabel={saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Saved to Binge List" : "Save to Binge List"} saveDisabled={!session || saveStatus === "loading" || saveStatus === "saved"} />
          })}
          {savedNotice && <p className="save-notice" role="status">{savedNotice}</p>}
        </section>

        <section className="account-panel" id="account" aria-labelledby="account-title">
          <div className="section-heading"><div><span className="step">02</span><h2 id="account-title">Your account</h2></div><span className="section-note">Save films for later</span></div>
          {!isSupabaseConfigured ? <p className="account-hint">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable accounts and saving. Discovery still works without login.</p> : sessionLoading ? <p className="account-hint" role="status">Restoring your session…</p> : session?.user ? <div className="signed-in"><p>Signed in as <strong>{session.user.email}</strong></p></div> : <form className="auth-form" onSubmit={submitAuth}>
            <div className="auth-tabs"><button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>Log in</button><button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setAuthError('') }}>Create account</button></div>
            <div className="auth-fields"><label>Email<input type="email" autoComplete="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength="6" required value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} /></label><button className="spin-button" type="submit" disabled={authStatus === 'loading'}>{authStatus === 'loading' ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Log in'}</button></div>
            {authError && <p className="inline-error" role="alert">{authError}</p>}
          </form>}
        </section>
        <section className="binge-panel" id="binge-list" aria-labelledby="binge-title">
          <div className="section-heading"><div><span className="step">03</span><h2 id="binge-title">Binge List</h2></div><span className="section-note">Your saved movie night queue</span></div>
          {!session?.user ? <p className="account-hint">Log in to save, view, and manage your movies.</p> : savedStatus === 'loading' ? <p className="account-hint" role="status">Loading your Binge List…</p> : savedStatus === 'error' ? <p className="inline-error" role="alert">{savedError}</p> : savedMovies.length === 0 ? <p className="account-hint">Your list is empty. Spin the wheel and save a movie for later.</p> : <div className="saved-grid">{savedMovies.map((row) => <article className="saved-card" key={row.id}>{row.poster_path ? <img src={`https://image.tmdb.org/t/p/w342${row.poster_path}`} alt={`${row.title} poster`} /> : <div className="saved-poster-missing">No poster</div>}<div className="saved-copy"><strong>{row.title}</strong><small>{row.watched ? 'Watched' : 'Not watched'}</small><div className="saved-actions"><button type="button" onClick={() => updateSavedMovie(row, 'toggle')}>{row.watched ? 'Mark unwatched' : 'Mark watched'}</button><button type="button" onClick={() => updateSavedMovie(row, 'remove')}>Remove</button></div></div></article>)}</div>}
          {savedError && <p className="inline-error" role="alert">{savedError}</p>}
        </section>

        <section className="footnote" id="how-it-works"><div className="foot-icon">✦</div><div><strong>A little movie-night magic</strong><p>We search thousands of films, then leave the final pick to chance.</p></div><span className="foot-count">01 <i /> 04</span></section>
      </main>
      <footer><span>Made for the “what should we watch?” moment.</span><span>© 2026 Reel Good</span></footer>
    </div>
  )
}

function MovieCard({ movie, mood, pick, total, onSave, saveLabel, saveDisabled }) {
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
  const year = movie.release_date?.slice(0, 4)
  return <article className="movie-result" style={{ animationDelay: `${(pick - 1) * 0.12}s` }}><div className="result-label"><span>✦</span> PICK {pick} OF {total} <i /> <small>{mood.title}</small></div><div className="movie-card">
    <div className="poster-wrap">{poster ? <img src={poster} alt={`${movie.title} poster`} /> : <div className="poster-missing"><span>✳</span><small>POSTER UNAVAILABLE</small></div>}<span className="poster-stamp">YOUR<br />PICK</span></div>
    <div className="movie-info"><div className="movie-kicker">{year || 'A GREAT PICK'} <i /> {movie.media_type === 'tv' ? 'TV SERIES' : 'FEATURE FILM'}</div><h3>{movie.title || 'Untitled movie'}</h3><div className="movie-meta"><span className="rating"><b>★</b> {movie.vote_average ? movie.vote_average.toFixed(1) : '—'} <small>/ 10</small></span><i /> <span>{movie.runtime ? `${movie.runtime} min${movie.media_type === 'tv' ? ' / episode' : ''}` : 'Runtime unavailable'}</span></div><p className="overview">{movie.overview || 'No overview is available for this film. The perfect excuse to go in completely blind.'}</p><div className="movie-actions">{getTrailerUrl(movie) ? <a className="primary-action" href={getTrailerUrl(movie)} target="_blank" rel="noreferrer"><span>▶</span> Watch trailer</a> : <span className="unavailable-action">Trailer unavailable</span>}<a className="secondary-action" href={getWatchUrl(movie)} target="_blank" rel="noreferrer">Where to watch <span>↗</span></a><button className="save-action" type="button" onClick={onSave} disabled={saveDisabled}>{saveLabel}</button></div></div>
  </div></article>
}

export default App
