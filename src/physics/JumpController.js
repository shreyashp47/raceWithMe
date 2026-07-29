import * as THREE from 'three'

export class JumpController {
  constructor(opts = {}) {
    this.gravity = opts.gravity ?? -25
    this.launchMultiplier = opts.launchMultiplier ?? 0.55
    this.minLaunchSpeed = opts.minLaunchSpeed ?? 3
    this.maxLaunchSpeed = opts.maxLaunchSpeed ?? 25
    this.minAirTime = opts.minAirTime ?? 0.12
    this.maxCrashImpact = opts.maxCrashImpact ?? 14

    this.isAirborne = false
    this.airTime = 0
    this.justLanded = false
    this.justCrashed = false
  }

  update(bike, sampleGround, dt) {
    this.justLanded = false
    this.justCrashed = false

    const ground = sampleGround(bike.mesh.position.x, bike.mesh.position.z)

    if (!this.isAirborne) {
      const heightAboveGround = bike.mesh.position.y - ground.height

      if (ground.onRamp && bike.speed > this.minLaunchSpeed && heightAboveGround < 0.6) {
        const launchPower = bike.speed * this.launchMultiplier
        bike.velocity.y = launchPower
        this.isAirborne = true
        this.airTime = 0
      }
      return
    }

    this.airTime += dt
    bike.velocity.y += this.gravity * dt
    bike.mesh.position.y += bike.velocity.y * dt

    const pitchTarget = THREE.MathUtils.clamp(-bike.velocity.y / 15, -0.45, 0.3)
    bike.pitch = THREE.MathUtils.lerp(bike.pitch, pitchTarget, Math.min(1, 5 * dt))

    if (bike.mesh.position.y <= ground.height && this.airTime > this.minAirTime) {
      bike.mesh.position.y = ground.height
      this.isAirborne = false
      bike.velocity.y = 0
      bike.pitch = 0

      const impactSpeed = Math.abs(bike.velocity.y)
      if (impactSpeed > this.maxCrashImpact) {
        this.justCrashed = true
      } else {
        this.justLanded = true
      }
    }
  }
}