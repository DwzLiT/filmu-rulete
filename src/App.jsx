import { useState } from 'react'
import { discoverMovie, getMovieDetails, getTrailerUrl, getWatchUrl } from './lib/tmdb.js'
import './App.css'

const moods = [
  { id: 'mind', title: 'Mind-bending Sci-Fi', icon: '✳', description: 'Reality is optional', genre: '878', rating: 7, color: 'violet' },
  { id: 'bad', title: "So Bad It's Good", icon: '☻', description: 'Beautifully terrible', rating: 4.5, votes: 100, color: 'lime' },
  { id: 'cry', title: 'Crying on the Couch', icon: '☂', description: 'Feel all the feelings', genre: '18,10749', rating: 7, color: 'blue' },
  { id: 'rush', title: 'Adrenaline Rush', icon: '↗', description: 'No time to blink', genre: '28,53', rating: 6.5, color: 'orange' },
]

function App() {
  const [mood, setMood] = useState(moods[0])
  const [movie, setMovie] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const spin = async () => {
    setStatus('loading')
    setError('')
    try {
      const pick = await discoverMovie(mood)
      setMovie(null)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const details = await getMovieDetails(pick.id)
      setMovie(details)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Reel Good home"><span className="brand-mark">r</span><span>reel<span className="brand-light">good</span></span></a>
        <nav aria-label="Main navigation"><a className="nav-active" href="#home">Discover</a><a href="#how-it-works">How it works</a></nav>
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
            {moods.map((item) => <button key={item.id} type="button" className={`mood-card ${item.color} ${mood.id === item.id ? 'selected' : ''}`} onClick={() => setMood(item)} aria-pressed={mood.id === item.id}>
              <span className="mood-icon">{item.icon}</span><span className="mood-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="radio"><i /></span>
            </button>)}
          </div>

          <div className="spin-row"><span className="spin-caption"><span className="sparkle">✦</span> One pick. Zero decision fatigue.</span><button className="spin-button" type="button" onClick={spin} disabled={status === 'loading'}><span>{status === 'loading' ? 'Finding your film' : movie ? 'Spin again' : 'Spin the wheel'}</span><span className={status === 'loading' ? 'button-icon spinning' : 'button-icon'}>✳</span></button></div>

          {status === 'loading' && <div className="roulette" role="status"><div className="loader-orbit"><span>✳</span></div><strong>Shuffling the reels…</strong><small>Finding your kind of movie magic</small></div>}
          {status === 'error' && <div className="notice error-notice" role="alert"><span>!</span><div><strong>We hit a snag.</strong><p>{error}</p></div><button type="button" onClick={spin}>Try again</button></div>}
          {status === 'ready' && movie && <MovieCard movie={movie} mood={mood} />}
        </section>

        <section className="footnote" id="how-it-works"><div className="foot-icon">✦</div><div><strong>A little movie-night magic</strong><p>We search thousands of films, then leave the final pick to chance.</p></div><span className="foot-count">01 <i /> 04</span></section>
      </main>
      <footer><span>Made for the “what should we watch?” moment.</span><span>© 2026 Reel Good</span></footer>
    </div>
  )
}

function MovieCard({ movie, mood }) {
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
  const year = movie.release_date?.slice(0, 4)
  return <article className="movie-result" aria-live="polite"><div className="result-label"><span>✦</span> TONIGHT’S PICK <i /> <small>{mood.title}</small></div><div className="movie-card">
    <div className="poster-wrap">{poster ? <img src={poster} alt={`${movie.title} poster`} /> : <div className="poster-missing"><span>✳</span><small>POSTER UNAVAILABLE</small></div>}<span className="poster-stamp">YOUR<br />PICK</span></div>
    <div className="movie-info"><div className="movie-kicker">{year || 'A GREAT PICK'} <i /> FEATURE FILM</div><h3>{movie.title || 'Untitled movie'}</h3><div className="movie-meta"><span className="rating"><b>★</b> {movie.vote_average ? movie.vote_average.toFixed(1) : '—'} <small>/ 10</small></span><i /> <span>{movie.runtime ? `${movie.runtime} min` : 'Runtime unavailable'}</span></div><p className="overview">{movie.overview || 'No overview is available for this film. The perfect excuse to go in completely blind.'}</p><div className="movie-actions">{getTrailerUrl(movie) ? <a className="primary-action" href={getTrailerUrl(movie)} target="_blank" rel="noreferrer"><span>▶</span> Watch trailer</a> : <span className="unavailable-action">Trailer unavailable</span>}<a className="secondary-action" href={getWatchUrl(movie)} target="_blank" rel="noreferrer">Where to watch <span>↗</span></a></div></div>
  </div></article>
}

export default App
