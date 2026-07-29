import * as THREE from 'three'

export const Materials = {
  chrome: () => new THREE.MeshStandardMaterial({
    color: 0xcfd6dc, roughness: 0.15, metalness: 1.0, flatShading: true
  }),
  paint: (colorHex) => new THREE.MeshStandardMaterial({
    color: colorHex, roughness: 0.35, metalness: 0.4, flatShading: true
  }),
  darkMetal: () => new THREE.MeshStandardMaterial({
    color: 0x1c1c1e, roughness: 0.6, metalness: 0.3, flatShading: true
  }),
  rubber: () => new THREE.MeshStandardMaterial({
    color: 0x141414, roughness: 0.95, metalness: 0.0, flatShading: true
  }),
  glass: (colorHex = 0x88ccff) => new THREE.MeshStandardMaterial({
    color: colorHex, roughness: 0.05, metalness: 0.6,
    transparent: true, opacity: 0.55, flatShading: true
  }),
  skin: () => new THREE.MeshStandardMaterial({
    color: 0xd9a066, roughness: 0.85, metalness: 0.0, flatShading: true
  }),
  emissive: (colorHex, intensity = 1.2) => new THREE.MeshStandardMaterial({
    color: colorHex, emissive: colorHex, emissiveIntensity: intensity,
    roughness: 0.3, metalness: 0.2, flatShading: true
  }),
  asphalt: () => new THREE.MeshStandardMaterial({
    color: 0x2b2b2e, roughness: 0.85, metalness: 0.05, flatShading: false
  }),
  dirt: () => new THREE.MeshStandardMaterial({
    color: 0x4a3a2a, roughness: 1.0, metalness: 0.0, flatShading: false
  }),
  grass: () => new THREE.MeshStandardMaterial({
    color: 0x3f6b34, roughness: 0.9, metalness: 0.0, flatShading: false
  }),
  rock: () => new THREE.MeshStandardMaterial({
    color: 0x7d7468, roughness: 1.0, metalness: 0.05, flatShading: true
  }),
  bark: () => new THREE.MeshStandardMaterial({
    color: 0x5a3d2b, roughness: 0.9, metalness: 0.0, flatShading: true
  }),
  foliage: () => new THREE.MeshStandardMaterial({
    color: 0x2d5a34, roughness: 0.85, metalness: 0.0, flatShading: true
  }),
}

export function auditMaterials(scene) {
  const issues = []
  scene.traverse(obj => {
    if (!obj.isMesh || !obj.material) return
    const m = obj.material
    if (m.type === 'MeshBasicMaterial') {
      issues.push(`${obj.name || obj.uuid}: uses MeshBasicMaterial (no lighting)`)

    }
    if (m.isMeshStandardMaterial && m.roughness === 1 && m.metalness === 0.5) {
      issues.push(`${obj.name || obj.uuid}: default roughness/metalness (untuned)`)
    }
  })
  if (issues.length) {
    console.warn(`Material audit found ${issues.length} untuned material(s):`)
    issues.forEach(i => console.warn(' -', i))
  } else {
    console.log('Material audit: all clear.')
  }
  return issues
}
