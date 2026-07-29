export class AudioManager {
  ctx
  engineOsc
  engineGain
  bgGain

  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  resume() {
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  startEngine() {
    this.engineOsc = this.ctx.createOscillator()
    this.engineGain = this.ctx.createGain()
    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.value = 80
    this.engineGain.gain.value = 0
    this.engineOsc.connect(this.engineGain)
    this.engineGain.connect(this.ctx.destination)
    this.engineOsc.start()
  }

  updateEngine(speed) {
    if (!this.engineOsc) return
    const f = 60 + Math.abs(speed) * 20
    this.engineOsc.frequency.value = Math.min(f, 300)
    this.engineGain.gain.value = Math.min(Math.abs(speed) * 0.02, 0.15)
  }

  playCollision() {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = 150
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.3)
  }

  startBgMusic() {
    this.bgGain = this.ctx.createGain()
    this.bgGain.gain.value = 0.08
    this.bgGain.connect(this.ctx.destination)
    this.playBgLoop()
  }

  playBgLoop() {
    if (!this.bgGain) return
    const now = this.ctx.currentTime
    const notes = [130.81, 146.83, 164.81, 174.61, 196, 220, 261.63]
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0, now + i * 0.25)
      g.gain.linearRampToValueAtTime(0.15, now + i * 0.25 + 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.2)
      osc.connect(g)
      g.connect(this.bgGain)
      osc.start(now + i * 0.25)
      osc.stop(now + i * 0.25 + 0.2)
    })

    setTimeout(() => this.playBgLoop(), notes.length * 250)
  }
}
