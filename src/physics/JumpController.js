import * as THREE from 'three'

export class JumpController {
  constructor(opts = {}) {
    this.gravity = opts.gravity ?? -22
    this.maxSafeLandingAngle = opts.maxSafeLandingAngle ?? 0.9
    this.minAirTimeForLanding = opts.minAirTimeForLanding ?? 0.12

    this.isAirborne = false
    this.airTime = 0
    this.justLanded = false
    this.justCrashed = false
    this.lastGroundNormal = new THREE.Vector3(0, 1, 0)
  }

  update(bike, sampleGround, dt) {
    this.justLanded = false
    this.justCrashed = false

    const ground = sampleGround(bike.position.x, bike.position.z)

    if (!this.isAirborne) {
      const heightAboveGround = bike.position.y - ground.height

      if (ground.onRamp && bike.forwardSpeed > 3) {
        const rampTilt = 1 - ground.normal.y
        const launchPower = bike.forwardSpeed * (0.35 + rampTilt * 0.9)

        bike.velocity.y = launchPower
        this.isAirborne = true
        this.airTime = 0
      } else {
        bike.position.y = ground.height
        this.lastGroundNormal.copy(ground.normal)
      }
      return
    }

    this.airTime += dt
    bike.velocity.y += this.gravity * dt
    bike.position.y += bike.velocity.y * dt

    const fallRatio = THREE.MathUtils.clamp(-bike.velocity.y / 15, -1, 1)
    bike.pitch = THREE.MathUtils.lerp(bike.pitch, fallRatio * 0.3, Math.min(1, 4 * dt))

    if (bike.position.y <= ground.height && this.airTime > this.minAirTimeForLanding) {
      bike.position.y = ground.height

      const velDir = bike.velocity.clone().normalize()
      const landingAngle = velDir.angleTo(ground.normal.clone().negate())
      const impactSpeed = Math.abs(bike.velocity.y)

      this.isAirborne = false
      bike.velocity.y = 0
      bike.pitch = 0

      if (landingAngle > this.maxSafeLandingAngle && impactSpeed > 8) {
        this.justCrashed = true
      } else {
        this.justLanded = true
      }

      this.lastGroundNormal.copy(ground.normal)
    }
  }

  getCurrentAirHeight(bike, sampleGround) {
    const ground = sampleGround(bike.position.x, bike.position.z)
    return Math.max(0, bike.position.y - ground.height)
  }
}
