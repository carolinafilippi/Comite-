/** Efectos sutiles y opcionales (tecla M). La experiencia no depende del audio. */
let ctx: AudioContext | null = null
export function playBlip(kind: 'vote' | 'end' | 'reveal') {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator(), g = ctx.createGain()
    const f = kind === 'vote' ? 880 : kind === 'reveal' ? 660 : 440
    o.type = 'sine'; o.frequency.value = f
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(kind === 'vote' ? 0.04 : 0.08, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === 'end' ? 0.9 : 0.25))
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1)
  } catch { /* sin audio */ }
}
