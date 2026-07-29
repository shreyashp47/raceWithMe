import * as THREE from 'three'
import { Materials } from '../materials/MaterialPresets.js'

/**
 * Creates a stylized low-poly dirt/downhill bike.
 * @param {number} colorHex - primary body color (e.g. 0xff4400)
 * @param {object} opts - { transparent, opacity }
 * @returns {THREE.Group}
 */
export function createBikeMesh(colorHex = 0xff4400, opts = {}) {
  const group = new THREE.Group()
  const isTransparent = !!opts.transparent
  const opacityVal = opts.transparent ? (opts.opacity || 0.4) : 1
  const applyOpts = (mat) => { mat.transparent = isTransparent; mat.opacity = opacityVal; return mat }

  const bodyMat = applyOpts(Materials.paint(colorHex))
  const darkMat = applyOpts(Materials.darkMetal())
  const chromeMat = applyOpts(Materials.chrome())
  const rubberMat = applyOpts(Materials.rubber())
  const glassMat = Materials.glass()
  const skinMat = Materials.skin()
  const headlightMat = Materials.emissive(0xffaa33, 1.2)
  const taillightMat = Materials.emissive(0xff2222, 0.8)

  // ================= WHEELS =================
  function makeWheel(radius, width) {
    const wheelGroup = new THREE.Group()
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16)
    tireGeo.rotateZ(Math.PI / 2)
    const tire = new THREE.Mesh(tireGeo, rubberMat)
    wheelGroup.add(tire)

    // hub + spokes
    const hubGeo = new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, width * 1.4, 8)
    hubGeo.rotateZ(Math.PI / 2)
    const hub = new THREE.Mesh(hubGeo, chromeMat)
    wheelGroup.add(hub)

    for (let i = 0; i < 6; i++) {
      const spokeGeo = new THREE.BoxGeometry(width * 0.6, radius * 1.7, 0.01)
      const spoke = new THREE.Mesh(spokeGeo, chromeMat)
      spoke.rotation.x = (Math.PI / 6) * i
      wheelGroup.add(spoke)
    }
    return wheelGroup
  }

  const frontWheel = makeWheel(0.22, 0.06)
  frontWheel.position.set(0, 0.22, 0.48)
  group.add(frontWheel)

  const rearWheel = makeWheel(0.24, 0.07)
  rearWheel.position.set(0, 0.24, -0.48)
  group.add(rearWheel)

  // Fender (front)
  const fenderGeo = new THREE.BoxGeometry(0.12, 0.02, 0.22)
  const fender = new THREE.Mesh(fenderGeo, darkMat)
  fender.position.set(0, 0.37, 0.46)
  fender.rotation.x = -0.15
  group.add(fender)

  // ================= FORK =================
  function makeForkLeg(xOffset) {
    const forkGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.42, 8)
    const fork = new THREE.Mesh(forkGeo, chromeMat)
    fork.position.set(xOffset, 0.33, 0.42)
    fork.rotation.x = -0.35
    return fork
  }
  group.add(makeForkLeg(-0.09))
  group.add(makeForkLeg(0.09))

  // ================= FRAME =================
  const frameCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.40, 0.36),
    new THREE.Vector3(0, 0.30, 0.10),
    new THREE.Vector3(0, 0.20, -0.10),
    new THREE.Vector3(0, 0.20, -0.30)
  ])
  const frameGeo = new THREE.TubeGeometry(frameCurve, 12, 0.035, 6, false)
  const frame = new THREE.Mesh(frameGeo, darkMat)
  group.add(frame)

  // Downtube
  const downtubeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6)
  const downtube = new THREE.Mesh(downtubeGeo, darkMat)
  downtube.position.set(0, 0.26, 0.20)
  downtube.rotation.x = 0.9
  group.add(downtube)

  // Tank
  const tankGeo = new THREE.BoxGeometry(0.16, 0.15, 0.24)
  const tank = new THREE.Mesh(tankGeo, bodyMat)
  tank.position.set(0, 0.36, 0.16)
  tank.rotation.x = 0.12
  group.add(tank)

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.14, 0.05, 0.28)
  const seat = new THREE.Mesh(seatGeo, darkMat)
  seat.position.set(0, 0.34, -0.14)
  seat.rotation.x = -0.05
  group.add(seat)

  // Engine block
  const engineGeo = new THREE.BoxGeometry(0.14, 0.14, 0.2)
  const engine = new THREE.Mesh(engineGeo, darkMat)
  engine.position.set(0, 0.16, 0.02)
  group.add(engine)

  // Swingarm
  const swingGeo = new THREE.BoxGeometry(0.04, 0.04, 0.4)
  const swingL = new THREE.Mesh(swingGeo, darkMat)
  swingL.position.set(-0.06, 0.22, -0.28)
  group.add(swingL)
  const swingR = swingL.clone()
  swingR.position.x = 0.06
  group.add(swingR)

  // ================= DETAILS =================
  // Headlights
  ;[-0.07, 0.07].forEach(x => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), headlightMat)
    hl.position.set(x, 0.42, 0.55)
    group.add(hl)
  })

  // Tail light
  const tailGeo = new THREE.BoxGeometry(0.08, 0.04, 0.02)
  const tail = new THREE.Mesh(tailGeo, taillightMat)
  tail.position.set(0, 0.34, -0.42)
  group.add(tail)

  // Handlebars
  const barGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.34, 8)
  barGeo.rotateZ(Math.PI / 2)
  const bar = new THREE.Mesh(barGeo, chromeMat)
  bar.position.set(0, 0.55, 0.38)
  group.add(bar)

  // Grips
  ;[-0.16, 0.16].forEach(x => {
    const gripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8)
    gripGeo.rotateZ(Math.PI / 2)
    const grip = new THREE.Mesh(gripGeo, rubberMat)
    grip.position.set(x, 0.55, 0.38)
    group.add(grip)
  })

  // Exhaust
  const exhaustGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.45, 8)
  const exhaust = new THREE.Mesh(exhaustGeo, chromeMat)
  exhaust.position.set(-0.11, 0.12, -0.08)
  exhaust.rotation.z = 0.1
  exhaust.rotation.x = 1.5
  group.add(exhaust)

  // ================= RIDER =================
  const rider = new THREE.Group()

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.16, 0.24, 0.13)
  const torso = new THREE.Mesh(torsoGeo, bodyMat)
  torso.position.set(0, 0.60, -0.06)
  torso.rotation.x = -0.5
  rider.add(torso)

  // Head + Helmet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), skinMat)
  head.position.set(0, 0.76, 0.12)
  rider.add(head)

  const helmetGeo = new THREE.SphereGeometry(0.085, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65)
  const helmet = new THREE.Mesh(helmetGeo, bodyMat)
  helmet.position.set(0, 0.79, 0.12)
  rider.add(helmet)

  const visorGeo = new THREE.SphereGeometry(0.06, 10, 10, 0, Math.PI, 0, Math.PI * 0.4)
  const visor = new THREE.Mesh(visorGeo, glassMat)
  visor.position.set(0, 0.775, 0.16)
  visor.rotation.x = 1.2
  rider.add(visor)

  // Arms
  function makeArm(xSide) {
    const shoulder = new THREE.Vector3(0.10 * xSide, 0.68, -0.02)
    const grip = new THREE.Vector3(0.16 * xSide, 0.55, 0.38)
    const dir = new THREE.Vector3().subVectors(grip, shoulder)
    const length = dir.length()
    const armGeo = new THREE.CylinderGeometry(0.025, 0.02, length, 6)
    const arm = new THREE.Mesh(armGeo, bodyMat)
    const mid = new THREE.Vector3().addVectors(shoulder, grip).multiplyScalar(0.5)
    arm.position.copy(mid)
    arm.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    return arm
  }
  rider.add(makeArm(-1))
  rider.add(makeArm(1))

  // Legs
  function makeLeg(xSide) {
    const hip = new THREE.Vector3(0.07 * xSide, 0.50, -0.14)
    const peg = new THREE.Vector3(0.14 * xSide, 0.22, 0.0)
    const dir = new THREE.Vector3().subVectors(peg, hip)
    const length = dir.length()
    const legGeo = new THREE.CylinderGeometry(0.03, 0.025, length, 6)
    const leg = new THREE.Mesh(legGeo, darkMat)
    const mid = new THREE.Vector3().addVectors(hip, peg).multiplyScalar(0.5)
    leg.position.copy(mid)
    leg.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    return leg
  }
  rider.add(makeLeg(-1))
  rider.add(makeLeg(1))

  group.add(rider)

  // ---- shadow settings ----
  group.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return group
}

export class Bike {
  mesh
  speed = 0
  maxSpeed = 10
  offroadMaxSpeed = 5
  acceleration = 8
  braking = 12
  turnSpeed = 3
  friction = 4
  offroadFriction = 8
  tilt = 0

  constructor(color) {
    this.mesh = createBikeMesh(color)
  }

  update(input, dt, track, terrain, trees, audio, onCollide) {
    const forward = input['w'] || input['arrowup']
    const reverse = input['s'] || input['arrowdown']
    const turnLeft = input['a'] || input['arrowleft']
    const turnRight = input['d'] || input['arrowright']

    const onTrack = this.isOnTrack(track)
    const currentMaxSpeed = onTrack ? this.maxSpeed : this.offroadMaxSpeed
    const currentFriction = onTrack ? this.friction : this.offroadFriction

    if (forward) {
      this.speed += this.acceleration * dt
    } else if (reverse) {
      this.speed -= this.braking * dt
    } else {
      if (this.speed > 0) {
        this.speed -= currentFriction * dt
        if (this.speed < 0) this.speed = 0
      } else if (this.speed < 0) {
        this.speed += currentFriction * dt
        if (this.speed > 0) this.speed = 0
      }
    }

    this.speed = Math.max(-currentMaxSpeed / 2, Math.min(currentMaxSpeed, this.speed))

    if (Math.abs(this.speed) > 0.1) {
      const turnDir = turnLeft ? 1 : turnRight ? -1 : 0
      this.mesh.rotation.y += turnDir * this.turnSpeed * dt * Math.sign(this.speed)

      const targetTilt = turnDir * Math.min(0.35, Math.abs(this.speed) * 0.025) * Math.sign(this.speed)
      this.tilt += (targetTilt - this.tilt) * Math.min(1, 8 * dt)
    } else {
      this.tilt += (0 - this.tilt) * Math.min(1, 8 * dt)
    }
    this.mesh.rotation.z = this.tilt

    const forwardVec = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion)
    const newPos = this.mesh.position.clone().add(forwardVec.multiplyScalar(this.speed * dt))

    if (this.speed > 0 && trees) {
      let hit = false
      for (const tree of trees) {
        const treePos = tree.isMesh ? new THREE.Vector3().setFromMatrixPosition(tree.matrixWorld) : tree
        const dist = newPos.distanceTo(treePos)
        if (dist < 1.2) {
          hit = true
          this.speed = -2
          audio?.playCollision()
          onCollide?.()
          break
        }
      }
      if (!hit) this.mesh.position.copy(newPos)
    } else {
      this.mesh.position.copy(newPos)
    }

    let targetY = 0
    if (terrain) {
      targetY = terrain.getHeight(this.mesh.position.x, this.mesh.position.z)
    }
    this.mesh.position.y += (targetY - this.mesh.position.y) * 0.1
  }

  isOnTrack(track) {
    let minDist = Infinity
    for (let t = 0; t <= 1; t += 0.02) {
      const p = track.spline.getPoint(t)
      const d = Math.sqrt((p.x - this.mesh.position.x) ** 2 + (p.z - this.mesh.position.z) ** 2)
      if (d < minDist) minDist = d
    }
    return minDist < track.width
  }
}
