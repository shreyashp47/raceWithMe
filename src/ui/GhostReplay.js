import { createBikeMesh } from '../objects/Bike.js'

const STORAGE_KEY = 'raceWithMe_ghost'

export class GhostReplay {
  active = false
  recording = false
  frames = []
  bike
  mesh

  constructor(scene) {
    this.mesh = createBikeMesh(0x00ffff, { transparent: true, opacity: 0.35, noHeadlight: true })
    this.mesh.visible = false
    scene.add(this.mesh)
    this.loadSaved()
  }

  startRecording() {
    this.frames = []
    this.recording = true
  }

  recordFrame(pos, rot) {
    if (!this.recording) return
    this.frames.push({ x: pos.x, y: pos.y, z: pos.z, ry: rot.y })
  }

  stopRecording() {
    this.recording = false
    if (this.frames.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.frames))
    }
  }

  loadSaved() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { this.frames = JSON.parse(saved) } catch {}
    }
  }

  toggle() {
    this.active = !this.active
    this.mesh.visible = this.active && this.frames.length > 0
    this.frameIndex = 0
  }

  frameIndex = 0

  update() {
    if (!this.active || this.frames.length === 0) return
    const f = this.frames[this.frameIndex]
    if (f) {
      this.mesh.position.set(f.x, f.y, f.z)
      this.mesh.rotation.y = f.ry
    }
    this.frameIndex = (this.frameIndex + 1) % this.frames.length
  }
}
