// Tiny pocket icons for the roulette wheel, one set per mood. Each icon is drawn in a 10×10 box centred on 0,0
// (top = towards the rim) and is a list of parts: `fill` and `stroke` use the icon colour, `cut` punches out detail.
const drop = 'M0-5C2-2 3.2-.3 3.2 1.6a3.2 3.2 0 0 1-6.4 0C-3.2-.3-2-2 0-5Z'
const heart = 'M0 4.5C-6 .5-5-4.5-2.5-4.5C-1.2-4.5-.4-3.6 0-2.8C.4-3.6 1.2-4.5 2.5-4.5C5-4.5 6 .5 0 4.5Z'
const sparkle = 'M0-5L1.2-1.2L5 0L1.2 1.2L0 5L-1.2 1.2L-5 0L-1.2-1.2Z'
const dot = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`
const saucer = [{ fill: 'M-2.5-.5a2.5 2.5 0 0 1 5 0Z' }, { fill: 'M-5 .8a5 1.6 0 1 0 10 0a5 1.6 0 1 0-10 0Z' }]
const petals = Array.from({ length: 5 }, (_, i) => {
  const angle = (i * 72 - 90) * (Math.PI / 180)
  return dot(Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, 2)
}).join('')

export const wheelIcons = {
  mind: [
    [{ fill: dot(0, 0, 2.8) }, { stroke: 'M-5.2 1.2a5.4 1.6-20 1 0 10.4-2.4a5.4 1.6-20 1 0-10.4 2.4' }],
    [...saucer, { stroke: 'M-2 3L-3 5M2 3L3 5' }],
    [{ fill: sparkle }],
    [{ stroke: 'M-5 0a5 1.8 0 1 0 10 0a5 1.8 0 1 0-10 0', transform: 'rotate(60)' }, { stroke: 'M-5 0a5 1.8 0 1 0 10 0a5 1.8 0 1 0-10 0', transform: 'rotate(-60)' }, { stroke: 'M-5 0a5 1.8 0 1 0 10 0a5 1.8 0 1 0-10 0' }, { fill: dot(0, 0, 1) }],
  ],
  bad: [
    [{ fill: 'M-3.5-1H3.5L2.6 5H-2.6Z' }, { fill: 'M-3.6-1.4a1.7 1.7 0 0 1 2-2.6a1.8 1.8 0 0 1 3.2 0a1.7 1.7 0 0 1 2 2.6Z' }, { cut: 'M-1.3 0h.7l.2 4.4h-.7ZM.6 0h.7l-.2 4.4h-.7Z' }],
    [{ stroke: 'M0-5V-2.6', dash: true }, ...saucer.map(({ fill }) => ({ fill, transform: 'translate(0 1) rotate(-12)' }))],
    [{ fill: 'M-4.5-.5H4.5V4.5H-4.5Z' }, { fill: 'M-4.6-1.4L3.9-4.4L4.4-2.9L-4.1.1Z' }, { cut: 'M-2.8-1.5L-1.4-3.1L-.4-3.4L-1.8-1.8ZM.2-2.6L1.6-4.1L2.6-4.5L1.2-2.9Z' }],
    [{ fill: 'M0-5L1.5-1.6L5-1.5L2.3.7L3.1 4.2L0 2.2L-3.1 4.2L-2.3.7L-5-1.5L-1.5-1.6Z', transform: 'rotate(14)' }],
  ],
  cry: [
    [{ fill: drop }],
    [{ fill: heart }, { cut: 'M.2-2.6L-1-.8L.8.6L-.5 2.8L.1 2.9L1.5.5L-.3-.8L.8-2.6Z' }],
    [{ fill: 'M-5 0a5 5 0 0 1 10 0Z' }, { stroke: 'M0 0V3.4a1.3 1.3 0 0 1-2.6 0' }],
    [{ fill: 'M-3.5 1a2.2 2.2 0 0 1 .2-4.4a3 3 0 0 1 5.6-.6a2.5 2.5 0 0 1 1.4 5Z' }, { stroke: 'M-2 2.6L-2.5 4.4M.5 2.6L0 4.4M3 2.6L2.5 4.4' }],
  ],
  rush: [
    [{ fill: 'M1-5L-3.5.6H-.3L-1 5L3.5-.8H.3Z' }],
    [{ fill: 'M0-5C2.5-2 3.8 0 3.8 1.6A3.8 3.4 0 0 1-3.8 1.6C-3.8-.4-2.4-1.4-1.6-3C-1-1.5-.2-1.2.4-.8C.8-2 .6-3.6 0-5Z' }],
    [{ stroke: 'M-4-3L-1 0L-4 3M0-3L3 0L0 3', transform: 'rotate(-90)' }],
    [{ fill: 'M0-5L1.2-2.2L4-3.2L2.6-.6L5 1L2 1.6L2.4 4.6L0 2.6L-2.4 4.6L-2 1.6L-5 1L-2.6-.6L-4-3.2L-1.2-2.2Z' }],
  ],
  scream: [
    [{ fill: 'M0-5a4.5 4.5 0 0 0-4.5 4.5c0 1.8 1 2.8 2 3.3V5h5V2.8c1-.5 2-1.5 2-3.3A4.5 4.5 0 0 0 0-5Z' }, { cut: dot(-1.7, -.6, 1.2) + dot(1.7, -.6, 1.2) + 'M-.5 1.6L0 .6L.5 1.6Z' }],
    [{ fill: 'M0-1C-1-2.5-2.5-3-4-2.6C-3.5-1.8-3.6-.8-4-.2C-4.6-.8-5.2-.6-5.5 0C-3.5 0-2 1 0 2.5C2 1 3.5 0 5.5 0C5.2-.6 4.6-.8 4-.2C3.6-.8 3.5-1.8 4-2.6C2.5-3 1-2.5 0-1Z' }],
    [{ fill: 'M-4 5V-1a4 4 0 0 1 8 0V5L2.7 3.6L1.3 5L0 3.6L-1.3 5L-2.7 3.6Z' }, { cut: dot(-1.4, -1, .9) + dot(1.4, -1, .9) }],
    [{ fill: drop }],
  ],
  binge: [
    [{ stroke: 'M-4.5-2H4.5V4H-4.5ZM-2-2L-3.5-4.5M2-2L3.5-4.5' }, { fill: 'M-3.2-.8H1.6V2.8H-3.2Z' }],
    [{ stroke: dot(0, 0, 4.6) }, { fill: 'M-1.4-2.5L2.8 0L-1.4 2.5Z' }],
    [{ fill: 'M-2-5H2V5H-2Z' }, { cut: dot(0, -3, .8) + 'M-1-1H1V0H-1ZM-1 1H1V2H-1Z' }],
    [{ fill: 'M-5 0V-1.5a1 1 0 0 1 2 0V0H3V-1.5a1 1 0 0 1 2 0V3H-5ZM-2.8-.9V-3.6H2.8V-.9Z' }, { stroke: 'M-4 3V4.4M4 3V4.4' }],
  ],
  doc: [
    [{ fill: 'M-5-2.5H1.5V2.5H-5Z' }, { fill: 'M2-1L5-2.5V2.5L2 1Z' }],
    [{ stroke: dot(-1.2, -1.2, 3.2) }, { stroke: 'M1.2 1.2L4.4 4.4', wide: true }],
    [{ stroke: dot(0, 0, 4.5) + 'M-1.8 0a1.8 4.5 0 1 0 3.6 0a1.8 4.5 0 1 0-3.6 0M-4.5 0H4.5' }],
    [{ fill: 'M0 5C-2.6 1.2-3.8-.6-3.8-1.6a3.8 3.8 0 0 1 7.6 0C3.8-.6 2.6 1.2 0 5Z' }, { cut: dot(0, -1.6, 1.3) }],
  ],
  toon: [
    [{ fill: heart }],
    [{ fill: sparkle }],
    [{ fill: petals }, { cut: dot(0, 0, 1.5) }],
    [{ stroke: 'M-5 1q1.25-3 2.5 0t2.5 0t2.5 0t2.5 0', wide: true }],
  ],
}
