import * as THREE from 'three'

export function createTree() {
  const group = new THREE.Group()

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 })
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d7d2d, roughness: 0.8 })

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), trunkMat)
  trunk.position.y = 0.5
  group.add(trunk)

  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), foliageMat)
  crown.position.y = 1.6
  crown.scale.y = 0.7
  group.add(crown)

  return group
}

export function scatterTrees(track, terrain, count = 80) {
  const trees = []
  const bbox = new THREE.Box3()

  for (let i = 0; i < count; i++) {
    const tree = createTree()
    let placed = false
    let attempts = 0

    while (!placed && attempts < 50) {
      attempts++
      const angle = Math.random() * Math.PI * 2
      const dist = track.width * 0.6 + Math.random() * 20
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist

      let tooCloseToTrack = false
      const p = new THREE.Vector3(x, 0, z)
      for (let t = 0; t <= 1; t += 0.02) {
        const sp = track.spline.getPoint(t)
        const d = p.distanceTo(sp)
        if (d < track.width * 1.2) { tooCloseToTrack = true; break }
      }
      if (tooCloseToTrack) continue

      const h = terrain ? terrain.getHeight(x, z) : 0
      tree.position.set(x, h, z)
      tree.scale.setScalar(0.6 + Math.random() * 0.8)
      tree.rotation.y = Math.random() * Math.PI * 2

      bbox.setFromObject(tree)
      let overlap = false
      for (const existing of trees) {
        const eb = new THREE.Box3().setFromObject(existing)
        if (bbox.intersectsBox(eb)) { overlap = true; break }
      }
      if (overlap) continue

      placed = true
    }

    if (placed) trees.push(tree)
  }

  return trees
}
