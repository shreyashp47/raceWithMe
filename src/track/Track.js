import * as THREE from 'three'
import { Checkpoint } from './Checkpoint.js'

const NUM_CHECKPOINTS = 12

export class Track {
  mesh
  spline
  width = 5
  checkpoints = []

  constructor() {
    const points = [
      new THREE.Vector3(0, 0, -50),
      new THREE.Vector3(50, 0, -45),
      new THREE.Vector3(80, 0, -20),
      new THREE.Vector3(80, 0, 20),
      new THREE.Vector3(50, 0, 45),
      new THREE.Vector3(-50, 0, 50),
      new THREE.Vector3(-80, 0, 20),
      new THREE.Vector3(-80, 0, -20),
      new THREE.Vector3(-50, 0, -45),
    ]

    this.spline = new THREE.CatmullRomCurve3(points, true)

    this.mesh = this.buildRoad()
    this.buildCheckpoints()
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
