import * as THREE from 'three'

export class ChaseCamera {
  constructor(camera, opts = {}) {
    this.camera = camera
    this.baseOffset = new THREE.Vector3(0, opts.height ?? 1.6, opts.distance ?? -4.2)
    this.lookOffset = new THREE.Vector3(0, opts.lookHeight ?? 0.9, opts.lookAhead ?? 3)
    this.baseFov = opts.baseFov ?? 55
    this.maxFovBoost = opts.maxFovBoost ?? 12
    this.positionStiffness = opts.positionStiffness ?? 6
    this.rotationStiffness = opts.rotationStiffness ?? 8
    this._currentPos = new THREE.Vector3()
    this._currentLook = new THREE.Vector3()
    this._initialized = false
    this._shakeIntensity = 0
    this._shakeDecay = opts.shakeDecay ?? 3.5
    this._shakeOffset = new THREE.Vector3()
  }

  update(target, speed, maxSpeed, dt) {
    const speedRatio = THREE.MathUtils.clamp(speed / maxSpeed, 0, 1)

    const desiredPos = this.baseOffset.clone()
    desiredPos.z -= speedRatio * 1.2
    desiredPos.applyQuaternion(target.quaternion)
    desiredPos.add(target.position)

    const desiredLook = this.lookOffset.clone()
    desiredLook.applyQuaternion(target.quaternion)
    desiredLook.add(target.position)

    if (!this._initialized) {
      this._currentPos.copy(desiredPos)
      this._currentLook.copy(desiredLook)
      this._initialized = true
    }

    const posLerp = 1 - Math.exp(-this.positionStiffness * dt)
    const lookLerp = 1 - Math.exp(-this.rotationStiffness * dt)
    this._currentPos.lerp(desiredPos, posLerp)
    this._currentLook.lerp(desiredLook, lookLerp)

    this._shakeIntensity = Math.max(0, this._shakeIntensity - this._shakeDecay * dt)
    if (this._shakeIntensity > 0.001) {
      this._shakeOffset.set(
        (Math.random() - 0.5) * this._shakeIntensity,
        (Math.random() - 0.5) * this._shakeIntensity,
        (Math.random() - 0.5) * this._shakeIntensity
      )
    } else {
      this._shakeOffset.set(0, 0, 0)
    }

    this.camera.position.copy(this._currentPos).add(this._shakeOffset)
    this.camera.lookAt(this._currentLook)

    const targetFov = this.baseFov + speedRatio * this.maxFovBoost
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, 6 * dt)
    this.camera.updateProjectionMatrix()
  }

  shake(intensity = 0.3) {
    this._shakeIntensity = Math.max(this._shakeIntensity, intensity)
  }
}
