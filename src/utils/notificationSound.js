export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -6
    compressor.ratio.value     = 20
    compressor.connect(ctx.destination)

    const master = ctx.createGain()
    master.gain.value = 1.0
    master.connect(compressor)

    // C5 → E5 → G5 ascending chime
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.type           = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.12
      env.gain.setValueAtTime(1.0, t)
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.connect(env)
      env.connect(master)
      osc.start(t)
      osc.stop(t + 0.6)
    })
  } catch { /* browser may block autoplay until first user interaction */ }
}
