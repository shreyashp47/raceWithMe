import * as THREE from 'three'
import { Bike } from '../objects/Bike.js'

export class AiBot {
  mesh
  speed = 0
  difficulty
  track

  constructor(track, difficulty, startPos, color) {
    this.track = track

    const maxSpeed = difficulty.maxSpeed || 7
    const acceleration = difficulty.acceleration || 6

    const bike = new Bike(color)
    this.mesh = bike.mesh
    this.mesh.position.copy(startPos)
    this.progress = 0
    this.maxSpeed = maxSpeed
    this.acceleration = acceleration
  }

  update(dt, terrain, trees) {

    let collisionSlowdown = 1
    if (trees) {
      for (const tree of trees) {
        const treePos = tree.isMesh ? new THREE.Vector3().setFromMatrixPosition(tree.matrixWorld) : tree
        const dist = this.mesh.position.distanceTo(treePos)
        if (dist < 2.5) {
          collisionSlowdown = Math.min(collisionSlowdown, 0.3)
        }
      }
    }

    this.progress += dt * 0.05 * collisionSlowdown * (this.maxSpeed / 7)

    if (this.progress > 1) this.progress -= 1

    const p = this.track.spline.getPoint(this.progress)
    const tangent = this.track.spline.getTangent(this.progress)

    this.mesh.position.copy(p)
    const targetY = terrain ? terrain.getHeight(p.x, p.z) : 0
    this.mesh.position.y += (targetY - this.mesh.position.y) * 0.1

    const angle = Math.atan2(tangent.x, tangent.z)
    this.mesh.rotation.y = angle
  }
}
