import * as THREE from 'three'

export class Terrain {
  mesh
  geometry

  constructor(size, segments, trackSpline) {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)
    this.geometry = geo

    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      const nearTrack = this.distanceToSpline(x, z, trackSpline) < 5
      if (nearTrack) continue

      const h = Math.sin(x * 0.08) * Math.cos(z * 0.1) * 10
        + Math.sin(x * 0.15 + z * 0.12) * 5
        + Math.sin(x * 0.3 + z * 0.25) * 2
      pos.setY(i, h)
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      color: 0x3f6b34, roughness: 0.9, metalness: 0
    })

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
    const info = this.getSurfaceInfo(x, z)
    return info.height
  }

  getSurfaceInfo(x, z) {
    const dir = new THREE.Vector3(x, 0, z)
    const raycaster = new THREE.Raycaster(dir, new THREE.Vector3(0, -1, 0), 0, 10)
    const hits = raycaster.intersectObject(this.mesh, false)
    if (hits.length > 0) {
      return {
        height: hits[0].point.y,
        normal: hits[0].face.normal.clone(),
      }
    }
    return { height: 0, normal: new THREE.Vector3(0, 1, 0) }
  }
}
