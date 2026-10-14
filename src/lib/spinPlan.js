// The random parts of one roulette spin, shared by the wheel animation and the spin sound so they stay in sync.
export const POCKETS = 24
export const SEGMENT = 360 / POCKETS

export function createSpinPlan() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reduceMotion ? 1400 : 3600
  const pocket = Math.floor(Math.random() * POCKETS)
  return {
    id: Date.now(),
    duration,
    ballTime: duration * 0.8,
    wheelTurn: (reduceMotion ? 1 : 2) * 360 + Math.random() * 360,
    // How far the ball travels against the wheel; it ends centred in a pocket.
    ballTurn: (reduceMotion ? 1 : 4) * 360 + pocket * SEGMENT + SEGMENT / 2,
  }
}

// Seconds at which the ball passes each fret, inverting easeOutCubic: angle(t) = turn * (1 - (1 - t)^3).
export function spinTicks(plan) {
  const ticks = []
  const ballSeconds = plan.ballTime / 1000
  for (let k = 1; k * SEGMENT < plan.ballTurn; k++) {
    const time = ballSeconds * (1 - Math.cbrt(1 - (k * SEGMENT) / plan.ballTurn))
    if (!ticks.length || time - ticks.at(-1) >= 0.035) ticks.push(time)
  }
  return ticks
}
