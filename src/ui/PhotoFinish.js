export class PhotoFinish {
  freezing = false
  freezeTimer = 0
  freezeDuration = 1.5
  onComplete

  trigger(onComplete) {
    this.freezing = true
    this.freezeTimer = 0
    this.onComplete = onComplete
  }

  update(dt) {
    if (!this.freezing) return false
    this.freezeTimer += dt
    if (this.freezeTimer >= this.freezeDuration) {
      this.freezing = false
      if (this.onComplete) this.onComplete()
      return false
    }
    return true
  }
}
