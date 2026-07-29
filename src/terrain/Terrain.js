import * as THREE from 'three'

export class Terrain {
  mesh
  geometry
  trackSpline

  constructor(size, segments, trackSpline) {
    this.trackSpline = trackSpline

    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)
    this.geometry = geo

    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      if (this.isNearSpline(x, z)) continue

      pos.setY(i, this.elevation(x, z))
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      color: 0x3f6b34, roughness: 0.9, metalness: 0
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.receiveShadow = true
  }

  elevation(x, z) {
    return Math.sin(x * 0.08) * Math.cos(z * 0.1) * 10
      + Math.sin(x * 0.15 + z * 0.12) * 5
      + Math.sin(x * 0.3 + z * 0.25) * 2
  }

  isNearSpline(x, z) {
    if (!this.trackSpline) return false
    let minDist = Infinity
    for (let t = 0; t <= 1; t += 0.01) {
      const p = this.trackSpline.getPoint(t)
      const d = Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2)
      if (d < minDist) minDist = d
    }
    return minDist < 5
  }

  getHeight(x, z) {
    if (this.isNearSpline(x, z)) return 0
    return this.elevation(x, z)
  }

  getSurfaceInfo(x, z) {
    return {
      height: this.getHeight(x, z),
      normal: new THREE.Vector3(0, 1, 0),
    }
  }
}
