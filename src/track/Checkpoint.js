import * as THREE from 'three'

export class Checkpoint {
  mesh
  index
  a
  b
  passed = false

  constructor(index, a, b) {
    this.index = index
    this.a = a
    this.b = b

    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()

    const geo = new THREE.PlaneGeometry(len, 2)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    })
    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.position.copy(mid)
    this.mesh.position.y = 1
    this.mesh.lookAt(mid.x + dir.z, 1, mid.z - dir.x)
  }
}
