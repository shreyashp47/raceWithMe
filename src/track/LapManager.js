export class LapManager {
  totalLaps = 3
  currentLap = 1
  nextCheckpoint = 0
  finished = false
  checkpoints

  constructor(checkpoints, totalLaps) {
    this.checkpoints = checkpoints
    if (totalLaps) this.totalLaps = totalLaps
  }

  get position() {
    return this.currentLap + this.nextCheckpoint / this.checkpoints.length
  }

  check(pos) {
    if (this.finished) return
    const cp = this.checkpoints[this.nextCheckpoint]
    if (!cp) return

    const cross = (cp.b.x - cp.a.x) * (pos.z - cp.a.z) - (cp.b.z - cp.a.z) * (pos.x - cp.a.x)
    const dot = (pos.x - cp.a.x) * (cp.b.x - cp.a.x) + (pos.z - cp.a.z) * (cp.b.z - cp.a.z)
    const lenSq = (cp.b.x - cp.a.x) ** 2 + (cp.b.z - cp.a.z) ** 2

    if (cross > 0 && dot >= 0 && dot <= lenSq) {
      cp.passed = true
      this.nextCheckpoint++

      if (this.nextCheckpoint >= this.checkpoints.length) {
        this.nextCheckpoint = 0
        this.checkpoints.forEach(c => c.passed = false)
        if (this.currentLap >= this.totalLaps) {
          this.finished = true
        } else {
          this.currentLap++
        }
      }
    }
  }
}
