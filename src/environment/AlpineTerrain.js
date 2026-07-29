import * as THREE from 'three'

export function colorTerrainByElevation(geometry, opts = {}) {
  const snowLine = opts.snowLine ?? 18
  const rockLine = opts.rockLine ?? 8
  const baseColor = new THREE.Color(opts.baseColor ?? 0xc97a3d)
  const rockColor = new THREE.Color(opts.rockColor ?? 0x8a7d6e)
  const snowColor = new THREE.Color(opts.snowColor ?? 0xf5f7fa)

  const pos = geometry.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)

    if (y < rockLine) {
      const t = THREE.MathUtils.clamp(y / rockLine, 0, 1)
      c.copy(baseColor).lerp(rockColor, t * 0.4)
    } else if (y < snowLine) {
      const t = THREE.MathUtils.clamp((y - rockLine) / (snowLine - rockLine), 0, 1)
      c.copy(rockColor).lerp(snowColor, t)
    } else {
      c.copy(snowColor)
    }

    const noise = (Math.random() - 0.5) * 0.04
    c.r = THREE.MathUtils.clamp(c.r + noise, 0, 1)
    c.g = THREE.MathUtils.clamp(c.g + noise, 0, 1)
    c.b = THREE.MathUtils.clamp(c.b + noise, 0, 1)

    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

export function createTerrainMaterial() {
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true
  })
}

export function createWaterPlane(width, length) {
  const geo = new THREE.PlaneGeometry(width, length, 1, 1)
  geo.rotateX(-Math.PI / 2)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2f6fa3,
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85
  })
  const water = new THREE.Mesh(geo, mat)
  water.receiveShadow = true
  return water
}

export function applyAlpineAtmosphere(scene, opts = {}) {
  const hazeColor = new THREE.Color(opts.hazeColor ?? 0xcfe3f0)
  scene.background = hazeColor
  scene.fog = new THREE.Fog(hazeColor, opts.near ?? 25, opts.far ?? 150)
}
