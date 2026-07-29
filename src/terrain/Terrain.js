import * as THREE from 'three'
import { Materials } from '../materials/MaterialPresets.js'

export class Terrain {
  mesh

  constructor(size, segments, trackSpline) {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      const nearTrack = this.distanceToSpline(x, z, trackSpline) < 5
      if (nearTrack) continue

      const h = Math.sin(x * 0.15) * Math.cos(z * 0.2) * 1.5
        + Math.sin(x * 0.3 + z * 0.25) * 0.8
      pos.setY(i, h)
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()

    const mat = Materials.grass()

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.receiveShadow = true
  }

  distanceToSpline(x, z, spline) {
    let minDist = Infinity
    for (let t = 0; t <= 1; t += 0.01) {
      const p = spline.getPoint(t)
      const d = Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2)
      if (d < minDist) minDist = d
    }
    return minDist
  }

  getHeight(x, z) {
    const dir = new THREE.Vector3(x, 0, z)
    const raycaster = new THREE.Raycaster(dir, new THREE.Vector3(0, -1, 0), 0, 10)
    const hits = raycaster.intersectObject(this.mesh, false)
    return hits.length > 0 ? hits[0].point.y : 0
  }
}
