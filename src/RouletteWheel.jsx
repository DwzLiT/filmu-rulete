import { useEffect, useRef } from 'react'
import { SEGMENT } from './lib/spinPlan.js'
import { wheelIcons } from './lib/wheelIcons.js'

const CENTER = 110
const EASE_OUT = 'cubic-bezier(.33,1,.68,1)' // easeOutCubic, matched by the tick maths in spinTicks()

function point(angle, radius) {
  const radians = ((angle - 90) * Math.PI) / 180
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)]
}

function pocketPath(index, inner, outer) {
  const at = (angle, radius) => point(angle, radius).map((value) => value.toFixed(2)).join(' ')
  const from = index * SEGMENT
  const to = from + SEGMENT
  return `M${at(from, inner)}L${at(from, outer)}A${outer} ${outer} 0 0 1 ${at(to, outer)}L${at(to, inner)}A${inner} ${inner} 0 0 0 ${at(from, inner)}Z`
}

const pockets = Array.from({ length: 360 / SEGMENT }, (_, index) => ({ index, path: pocketPath(index, 70, 95), angle: (index + 0.5) * SEGMENT }))
const studs = Array.from({ length: 16 }, (_, index) => point(index * 22.5 + 11.25, 105.5))
const deflectors = Array.from({ length: 8 }, (_, index) => index * 45)
const coneLines = Array.from({ length: 12 }, (_, index) => [point(index * 30, 24), point(index * 30, 67)])
const arms = [0, 90, 180, 270].map((angle) => point(angle, 44))

function PocketIcon({ parts }) {
  return parts.map(({ fill, stroke, cut, transform, dash, wide }, index) => fill ? <path key={index} d={fill} transform={transform} className="icon-fill" />
    : stroke ? <path key={index} d={stroke} transform={transform} className={wide ? 'icon-stroke wide' : 'icon-stroke'} strokeDasharray={dash ? '1 1.2' : undefined} />
      : <path key={index} d={cut} transform={transform} className="icon-cut" />)
}

export default function RouletteWheel({ plan, accent, theme, icon, label }) {
  const icons = wheelIcons[theme] ?? wheelIcons.mind
  const rootRef = useRef(null)
  const wheelRef = useRef(null)
  const ballRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    // Bring the whole wheel on screen, without scrolling its top out of view.
    const { top, bottom } = rootRef.current.getBoundingClientRect()
    const overflow = Math.min(bottom - window.innerHeight + 16, top - 12)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (overflow > 0) window.scrollBy({ top: overflow, behavior: reduceMotion ? 'auto' : 'smooth' })

    const options = { easing: EASE_OUT, fill: 'forwards' }
    const animations = [
      wheelRef.current.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${plan.wheelTurn}deg)` }], { ...options, duration: plan.duration }),
      ballRef.current.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${-plan.ballTurn}deg)` }], { ...options, duration: plan.ballTime }),
      // The ball rides the outer track, then drops into a pocket near the end.
      dotRef.current.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(0)', offset: 0.72 }, { transform: 'translateY(17px)' }], { duration: plan.ballTime, easing: 'ease-in', fill: 'forwards' }),
    ]
    return () => animations.forEach((animation) => animation.cancel())
  }, [plan])

  return <div ref={rootRef} className="roulette" role="status" style={{ '--accent': accent, '--zero': theme === 'bad' ? '#ff6fd8' : '#d1ff64' }}>
    <svg className="wheel" viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <linearGradient id="wheel-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4943" /><stop offset=".5" stopColor="#1c1c19" /><stop offset="1" stopColor="#34332e" /></linearGradient>
        <radialGradient id="wheel-pocket-shade" r=".5"><stop offset=".73" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="wheel-cone" r=".5"><stop offset="0" stopColor="#34332e" /><stop offset="1" stopColor="#141412" /></radialGradient>
        <radialGradient id="wheel-hub" cx=".35" cy=".3" r=".75"><stop offset="0" stopColor="#f6f3ed" stopOpacity=".9" /><stop offset=".35" style={{ stopColor: 'var(--accent)' }} /><stop offset="1" stopColor="#1b1b19" /></radialGradient>
        <radialGradient id="wheel-ball" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" /><stop offset=".6" stopColor="#dcd8cf" /><stop offset="1" stopColor="#8a877f" /></radialGradient>
        <linearGradient id="wheel-gloss" x1="0" y1="0" x2=".6" y2=".8"><stop offset="0" stopColor="#fff" stopOpacity=".14" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <circle cx={CENTER} cy={CENTER} r="109" fill="url(#wheel-metal)" className="wheel-rim" />
      {studs.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="1.3" className="wheel-stud" />)}
      <circle cx={CENTER} cy={CENTER} r="102.5" className="wheel-track" />
      {deflectors.map((angle) => <rect key={angle} x={CENTER - 2.2} y={CENTER - 101.5} width="4.4" height="4.4" transform={`rotate(${angle + 22.5} ${CENTER} ${CENTER}) rotate(45 ${CENTER} ${CENTER - 99.3})`} className="wheel-deflector" />)}
      <g ref={wheelRef} className="wheel-spin">
        {pockets.map(({ index, path }) => <path key={index} d={path} className={index === 0 ? 'pocket pocket-zero' : index % 2 ? 'pocket pocket-dark' : 'pocket pocket-accent'} />)}
        <circle cx={CENTER} cy={CENTER} r="95" fill="url(#wheel-pocket-shade)" />
        {pockets.map(({ index, angle }) => <g key={index} transform={`rotate(${angle} ${CENTER} ${CENTER}) translate(${CENTER} ${CENTER - 83.5}) scale(.95)`} className={index === 0 ? 'pocket-icon on-zero' : index % 2 ? 'pocket-icon on-dark' : 'pocket-icon on-accent'}><PocketIcon parts={icons[index % icons.length]} /></g>)}
        <circle cx={CENTER} cy={CENTER} r="95" className="wheel-ring" />
        <circle cx={CENTER} cy={CENTER} r="70" fill="url(#wheel-cone)" className="wheel-cone" />
        {coneLines.map(([[x1, y1], [x2, y2]], index) => <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className="wheel-cone-line" />)}
        {arms.map(([x, y], index) => <g key={index}><line x1={CENTER} y1={CENTER} x2={x} y2={y} className="wheel-arm" /><circle cx={x} cy={y} r="4.5" fill="url(#wheel-hub)" className="wheel-knob" /></g>)}
        <circle cx={CENTER} cy={CENTER} r="17" fill="url(#wheel-hub)" className="wheel-hub" />
        <text x={CENTER} y={CENTER} className="wheel-star">{icon}</text>
        <g ref={ballRef} className="wheel-spin">
          <circle ref={dotRef} cx={CENTER} cy="10" r="5" fill="url(#wheel-ball)" className="wheel-ball" />
        </g>
      </g>
      <circle cx={CENTER} cy={CENTER} r="109" fill="url(#wheel-gloss)" pointerEvents="none" />
    </svg>
    <strong>{label}</strong>
    <small>Finding your kind of movie magic</small>
  </div>
}
