// Roulette sound effects, synthesized with the Web Audio API so there are no audio files to load.
let context
let noiseBuffer

// Call from a click handler: browsers only allow audio to start after a user gesture.
export function unlockAudio() {
  if (!window.AudioContext) return null
  context ??= new AudioContext()
  if (context.state === 'suspended') context.resume()
  return context
}

function getNoise(ctx) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

// A short filtered noise burst: the ball clicking over a fret.
function click(ctx, output, time, { frequency, gain, length = 0.02 }) {
  const source = ctx.createBufferSource()
  source.buffer = getNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = frequency
  filter.Q.value = 5
  const envelope = ctx.createGain()
  envelope.gain.setValueAtTime(gain, time)
  envelope.gain.exponentialRampToValueAtTime(0.001, time + length)
  source.connect(filter).connect(envelope).connect(output)
  source.start(time, Math.random() * 0.9)
  source.stop(time + length + 0.01)
}

// Plays ticks at the given offsets (seconds), the ball rolling, and the ball dropping into a pocket at `dropAt`.
// Returns a function that silences the spin early.
export function playSpinSound(tickTimes, dropAt) {
  const ctx = unlockAudio()
  if (!ctx) return () => {}
  const output = ctx.createGain()
  output.gain.value = 0.7
  output.connect(ctx.destination)
  const start = ctx.currentTime + 0.03

  const rumble = ctx.createBufferSource()
  rumble.buffer = getNoise(ctx)
  rumble.loop = true
  const rumbleFilter = ctx.createBiquadFilter()
  rumbleFilter.type = 'lowpass'
  rumbleFilter.frequency.setValueAtTime(700, start)
  rumbleFilter.frequency.exponentialRampToValueAtTime(180, start + dropAt)
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.setValueAtTime(0.001, start)
  rumbleGain.gain.exponentialRampToValueAtTime(0.09, start + 0.15)
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, start + dropAt)
  rumble.connect(rumbleFilter).connect(rumbleGain).connect(output)
  rumble.start(start)
  rumble.stop(start + dropAt)

  for (const time of tickTimes) {
    const progress = time / dropAt
    click(ctx, output, start + time, { frequency: 2400 + Math.random() * 1400, gain: 0.08 + 0.22 * progress })
  }
  // The ball hops a couple of times before it settles.
  const settle = start + dropAt
  click(ctx, output, settle, { frequency: 1500, gain: 0.5, length: 0.04 })
  click(ctx, output, settle + 0.14, { frequency: 1700, gain: 0.32, length: 0.035 })
  click(ctx, output, settle + 0.24, { frequency: 1900, gain: 0.18, length: 0.03 })

  return () => {
    output.gain.cancelScheduledValues(ctx.currentTime)
    output.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
    setTimeout(() => output.disconnect(), 200)
  }
}
