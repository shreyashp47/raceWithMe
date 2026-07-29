import * as THREE from 'three'
import { Checkpoint } from './Checkpoint.js'

const NUM_CHECKPOINTS = 12

export class Track {
  mesh
  spline
  width = 5
  checkpoints = []
  ramps = []

  constructor() {
    const points = [
      new THREE.Vector3(0, 0, -35),
      new THREE.Vector3(20, 0, -30),
      new THREE.Vector3(40, 0, -15),
      new THREE.Vector3(45, 0, 5),
      new THREE.Vector3(35, 0, 25),
      new THREE.Vector3(15, 0, 35),
      new THREE.Vector3(-15, 0, 35),
      new THREE.Vector3(-35, 0, 25),
      new THREE.Vector3(-45, 0, 5),
      new THREE.Vector3(-40, 0, -15),
      new THREE.Vector3(-20, 0, -30),
    ]

    this.spline = new THREE.CatmullRomCurve3(points, true)

    this.mesh = this.buildRoad()
    this.buildCheckpoints()
    this.buildRamps()
  }

  buildRamps() {
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x8a7a60, roughness: 0.9, metalness: 0, flatShading: true
    })
    const rampList = [
      { progress: 0.18, height: 1.2 },
      { progress: 0.68, height: 1.2 },
    ]
    const depth = 3
    const halfW = this.width / 2

    for (const r of rampList) {
      const p = this.spline.getPoint(r.progress)
      const tangent = this.spline.getTangent(r.progress).normalize()

      const hw = halfW, hd = depth / 2, h = r.height
      const verts = [
        -hw, 0, -hd,  hw, 0, -hd,  -hw, 0, hd,
        hw, 0, hd,  -hw, h, hd,  hw, h, hd,
      ]
      const idx = [
        0,2,1, 1,2,3, 0,1,4, 1,5,4,
        2,4,3, 3,4,5, 0,4,2, 1,3,5,
      ]
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      geo.setIndex(idx)
      geo.computeVertexNormals()

      const ramp = new THREE.Mesh(geo, rampMat)
      ramp.position.copy(p)
      ramp.position.y = 0.2
      const angle = Math.atan2(tangent.x, tangent.z)
      ramp.rotation.y = angle
      ramp.receiveShadow = true
      ramp.castShadow = true
      this.mesh.add(ramp)

      this.ramps.push({
        mesh: ramp,
        position: p.clone(),
        tangent: tangent.clone(),
        angle,
        depth,
        height: h,
        halfW,
      })
    }
  }

  getRampInfo(x, z) {
    for (const r of this.ramps) {
      const dx = x - r.position.x
      const dz = z - r.position.z
      const localX = dx * Math.cos(r.angle) + dz * Math.sin(r.angle)
      const localZ = -dx * Math.sin(r.angle) + dz * Math.cos(r.angle)
      if (Math.abs(localX) < r.halfW && localZ > -r.depth / 2 && localZ < r.depth / 2) {
        const height = 0.2 + r.height * (localZ + r.depth / 2) / r.depth
        const normal = new THREE.Vector3(0, r.height / r.depth, 1).normalize()
        normal.applyAxisAngle(new THREE.Vector3(0, 1, 0), r.angle)
        return { height, normal, onRamp: true }
      }
    }
    return null
  }

  buildCheckpoints() {
    const halfW = this.width / 2
    for (let i = 0; i < NUM_CHECKPOINTS; i++) {
      const t = i / NUM_CHECKPOINTS
      const p = this.spline.getPoint(t)
      const tangent = this.spline.getTangent(t).normalize()
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x)
      const a = p.clone().add(normal.clone().multiplyScalar(-halfW))
      const b = p.clone().add(normal.clone().multiplyScalar(halfW))
      const cp = new Checkpoint(i, a, b)
      this.checkpoints.push(cp)
      this.mesh.add(cp.mesh)
    }
  }

  buildRoad() {
    const group = new THREE.Group()
    const segments = 200
    const halfW = this.width / 2

    const positions = []
    const uvs = []
    const indices = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const p = this.spline.getPoint(t)
      const tangent = this.spline.getTangent(t).normalize()
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x)

      const left = p.clone().add(normal.clone().multiplyScalar(-halfW))
      const right = p.clone().add(normal.clone().multiplyScalar(halfW))

      positions.push(left.x, 0.2, left.z, right.x, 0.2, right.z)
      uvs.push(0, t, 1, t)

      if (i < segments) {
        const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1
        indices.push(a, c, b, b, c, d)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      color: 0x9E876B,
      roughness: 0.9,
      metalness: 0,
    })

    const road = new THREE.Mesh(geo, mat)
    road.receiveShadow = true
    group.add(road)

    for (let side = -1; side <= 1; side += 2) {
      const edgePositions = []
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const p = this.spline.getPoint(t)
        const tangent = this.spline.getTangent(t).normalize()
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x)
        const edge = p.clone().add(normal.clone().multiplyScalar(side * halfW))
        edgePositions.push(edge.x, 0.21, edge.z)
      }
      const edgeGeo = new THREE.BufferGeometry()
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3))
      const edgeLine = new THREE.Line(edgeGeo, new THREE.LineBasicMaterial({ color: 0x4a6b3a }))
      group.add(edgeLine)
    }

    const dashMat = new THREE.LineBasicMaterial({ color: 0x6b7a5a })
    for (let i = 0; i < segments; i += 3) {
      const t = i / segments
      const p = this.spline.getPoint(t)
      const tangent = this.spline.getTangent(t).normalize()
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x)
      const mid = p.clone()
      const next = this.spline.getPoint(Math.min((i + 1) / segments, 1))
      const dashGeo = new THREE.BufferGeometry()
      const dashPos = new Float32Array([mid.x, 0.21, mid.z, next.x, 0.21, next.z])
      dashGeo.setAttribute('position', new THREE.BufferAttribute(dashPos, 3))
      const dash = new THREE.Line(dashGeo, dashMat)
      group.add(dash)
    }

    return group
  }
}
