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

  // Rider materials
  const gearMat = applyOpts(Materials.paint(colorHex))
  const glovesBootsMat = applyOpts(Materials.darkMetal())
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xf2f2f2, roughness: 0.5, metalness: 0.1, flatShading: true
  })

  // ================= WHEELS =================
  function makeWheel(radius, width) {
    const wheelGroup = new THREE.Group()
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16)
    tireGeo.rotateZ(Math.PI / 2)
    const tire = new THREE.Mesh(tireGeo, rubberMat)
    wheelGroup.add(tire)

    // Chunky tread knobs around the tire — reads as an off-road/MX tire
    // instead of a smooth cylinder.
    const knobCount = 16
    for (let i = 0; i < knobCount; i++) {
      const angle = (i / knobCount) * Math.PI * 2
      const knobGeo = new THREE.BoxGeometry(width * 1.05, radius * 0.16, radius * 0.16)
      const knob = new THREE.Mesh(knobGeo, rubberMat)
      knob.position.set(0, Math.sin(angle) * radius * 0.96, Math.cos(angle) * radius * 0.96)
      knob.rotation.x = angle
      wheelGroup.add(knob)
    }

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

    // Brake disc — thin chrome ring offset to one side of the hub
    const discGeo = new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, width * 0.15, 16)
    discGeo.rotateZ(Math.PI / 2)
    const disc = new THREE.Mesh(discGeo, chromeMat)
    disc.position.x = width * 0.7
    wheelGroup.add(disc)

    return wheelGroup
  }

  const frontWheel = makeWheel(0.22, 0.06)
  frontWheel.position.set(0, 0.22, 0.48)
  group.add(frontWheel)

  const rearWheel = makeWheel(0.24, 0.07)
  rearWheel.position.set(0, 0.24, -0.48)
  group.add(rearWheel)

  // Expose wheels so Bike.update() can spin them based on speed
  group.userData.frontWheel = frontWheel
  group.userData.rearWheel = rearWheel

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

  // Accent stripe on the tank — white racing stripe, common on MX bikes,
  // breaks up the flat body color panel.
  const stripeGeo = new THREE.BoxGeometry(0.162, 0.03, 0.24)
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xf2f2f2, roughness: 0.4, metalness: 0.1, flatShading: true
  })
  const stripe = new THREE.Mesh(stripeGeo, stripeMat)
  stripe.position.copy(tank.position)
  stripe.rotation.copy(tank.rotation)
  group.add(stripe)

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

  // Rear shock absorber — spring coil + damper body, running from the
  // frame down to the swingarm. This was previously missing, leaving the
  // rear end looking unsupported/floating.
  const shockBodyGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8)
  const shockBody = new THREE.Mesh(shockBodyGeo, darkMat)
  shockBody.position.set(0, 0.28, -0.22)
  shockBody.rotation.x = -0.55
  group.add(shockBody)

  const shockSpringGeo = new THREE.TorusGeometry(0.025, 0.006, 6, 10)
  for (let i = 0; i < 5; i++) {
    const coil = new THREE.Mesh(shockSpringGeo, chromeMat)
    const t = i / 4
    coil.position.set(0, 0.24 + t * 0.09, -0.16 - t * 0.13)
    coil.rotation.x = 1.0
    group.add(coil)
  }

  // Footpegs — small chrome pegs the rider's legs actually rest on
  ;[-1, 1].forEach(xSide => {
    const pegGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6)
    pegGeo.rotateZ(Math.PI / 2)
    const peg = new THREE.Mesh(pegGeo, chromeMat)
    peg.position.set(0.14 * xSide, 0.22, 0.0)
    group.add(peg)
  })

  // ================= DETAILS =================
  // Headlight bracket — small dark housing that anchors the lights near
  // the fork crown instead of them appearing to float/embed in the wheel.
  const bracketGeo = new THREE.BoxGeometry(0.14, 0.04, 0.03)
  const bracket = new THREE.Mesh(bracketGeo, darkMat)
  bracket.position.set(0, 0.485, 0.52)
  group.add(bracket)

  // Headlights — repositioned to sit above the wheel's top edge (wheel
  // radius 0.22 around y=0.22 center → top ≈0.44), previously at y=0.42
  // which overlapped the tire. Now clear with margin.
  ;[-0.05, 0.05].forEach(x => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), headlightMat)
    hl.position.set(x, 0.485, 0.53)
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

  // Chest number plate — small white panel, common MX jersey/plate detail
  const plateGeo = new THREE.BoxGeometry(0.1, 0.08, 0.01)
  const plate = new THREE.Mesh(plateGeo, accentMat)
  plate.position.set(0, 0.60, -0.005)
  plate.rotation.x = -0.5
  rider.add(plate)

  // Head + Helmet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), skinMat)
  head.position.set(0, 0.76, 0.12)
  rider.add(head)

  const helmetGeo = new THREE.SphereGeometry(0.085, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65)
  const helmet = new THREE.Mesh(helmetGeo, gearMat)
  helmet.position.set(0, 0.79, 0.12)
  rider.add(helmet)

  // Helmet peak — the forward-jutting bill characteristic of MX helmets
  const peakGeo = new THREE.BoxGeometry(0.1, 0.015, 0.06)
  const peak = new THREE.Mesh(peakGeo, gearMat)
  peak.position.set(0, 0.795, 0.205)
  peak.rotation.x = -0.35
  rider.add(peak)

  const visorGeo = new THREE.SphereGeometry(0.06, 10, 10, 0, Math.PI, 0, Math.PI * 0.4)
  const visor = new THREE.Mesh(visorGeo, glassMat)
  visor.position.set(0, 0.775, 0.16)
  visor.rotation.x = 1.2
  rider.add(visor)

  // Goggle strap — thin dark band across the helmet
  const strapGeo = new THREE.BoxGeometry(0.15, 0.025, 0.01)
  const strap = new THREE.Mesh(strapGeo, glovesBootsMat)
  strap.position.set(0, 0.795, 0.13)
  strap.rotation.x = 0.15
  rider.add(strap)

  // ---- Arms: two segments (upper arm + forearm) bent at the elbow ----
  // Previously a single straight cylinder shoulder-to-grip, which looked
  // stiff/robotic. Elbow pushed outward and down for a natural
  // elbows-out MX riding stance.
  function makeArm(xSide) {
    const armGroup = new THREE.Group()
    const shoulder = new THREE.Vector3(0.10 * xSide, 0.68, -0.02)
    const grip = new THREE.Vector3(0.16 * xSide, 0.55, 0.38)
    const elbow = new THREE.Vector3(
      (shoulder.x + grip.x) / 2 + 0.05 * xSide,
      (shoulder.y + grip.y) / 2 - 0.02,
      (shoulder.z + grip.z) / 2
    )

    function segment(a, b, r1, r2, mat) {
      const dir = new THREE.Vector3().subVectors(b, a)
      const length = dir.length()
      const geo = new THREE.CylinderGeometry(r1, r2, length, 6)
      const mesh = new THREE.Mesh(geo, mat)
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
      mesh.position.copy(mid)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
      return mesh
    }

    armGroup.add(segment(shoulder, elbow, 0.026, 0.022, gearMat))   // upper arm (jersey sleeve)
    armGroup.add(segment(elbow, grip, 0.021, 0.019, glovesBootsMat)) // forearm/glove color

    // Glove — small rounded block at the grip
    const gloveGeo = new THREE.BoxGeometry(0.04, 0.03, 0.05)
    const glove = new THREE.Mesh(gloveGeo, glovesBootsMat)
    glove.position.copy(grip)
    armGroup.add(glove)

    // Elbow guard accent
    const elbowGuard = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), accentMat)
    elbowGuard.position.copy(elbow)
    armGroup.add(elbowGuard)

    return armGroup
  }
  rider.add(makeArm(-1))
  rider.add(makeArm(1))

  // ---- Legs: two segments (thigh + shin) bent at the knee ----
  // Previously a single straight cylinder hip-to-peg. Knee pushed
  // forward/outward for a natural riding crouch, plus knee pad + boot.
  function makeLeg(xSide) {
    const legGroup = new THREE.Group()
    const hip = new THREE.Vector3(0.07 * xSide, 0.50, -0.14)
    const peg = new THREE.Vector3(0.14 * xSide, 0.22, 0.0)
    const knee = new THREE.Vector3(
      (hip.x + peg.x) / 2 + 0.04 * xSide,
      (hip.y + peg.y) / 2,
      (hip.z + peg.z) / 2 + 0.05
    )

    function segment(a, b, r1, r2, mat) {
      const dir = new THREE.Vector3().subVectors(b, a)
      const length = dir.length()
      const geo = new THREE.CylinderGeometry(r1, r2, length, 6)
      const mesh = new THREE.Mesh(geo, mat)
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
      mesh.position.copy(mid)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
      return mesh
    }

    legGroup.add(segment(hip, knee, 0.032, 0.027, gearMat))       // thigh (pants)
    legGroup.add(segment(knee, peg, 0.026, 0.03, glovesBootsMat)) // shin/boot color

    // Knee pad accent
    const kneePad = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), accentMat)
    kneePad.position.copy(knee)
    legGroup.add(kneePad)

    // Boot — bulkier block at the foot, MX boots are noticeably chunky
    const bootGeo = new THREE.BoxGeometry(0.055, 0.04, 0.11)
    const boot = new THREE.Mesh(bootGeo, glovesBootsMat)
    boot.position.set(peg.x, peg.y - 0.01, peg.z + 0.02)
    legGroup.add(boot)

    return legGroup
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
  tiltVelocity = 0

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

      // Spring-damped lean with grip + speed scaling
      const leanAmount = turnDir * Math.min(0.5, Math.abs(this.speed) * 0.03) * Math.sign(this.speed)
      const gripFactor = onTrack ? 1 : 0.55
      const targetTilt = leanAmount * gripFactor
      const spring = 14
      const damping = 16
      this.tiltVelocity += (targetTilt - this.tilt) * spring * dt
      this.tiltVelocity *= Math.max(0, 1 - damping * dt)
      this.tilt += this.tiltVelocity * dt
    } else {
      this.tiltVelocity += (0 - this.tilt) * 14 * dt
      this.tiltVelocity *= Math.max(0, 1 - 18 * dt)
      this.tilt += this.tiltVelocity * dt
    }
    this.mesh.rotation.z = this.tilt

    // Spin the wheels based on actual speed — radius-correct rotation rate
    // so wheel spin visually matches how fast the bike is moving.
    const wheelRadius = 0.23
    const spinDelta = (this.speed * dt) / wheelRadius
    if (this.mesh.userData.frontWheel) this.mesh.userData.frontWheel.rotation.x += spinDelta
    if (this.mesh.userData.rearWheel) this.mesh.userData.rearWheel.rotation.x += spinDelta

    // Fore-aft pitch: nose dips under braking, lifts under acceleration
    const targetPitch = forward ? -0.1 : reverse ? 0.15 : 0
    this.mesh.rotation.x += (targetPitch - this.mesh.rotation.x) * Math.min(1, 6 * dt)

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
