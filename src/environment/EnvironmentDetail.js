import * as THREE from 'three'
import { Materials } from '../materials/MaterialPresets.js'

/**
 * Adds dense, cheap environment detail: trees, rocks, grass tufts.
 * Uses InstancedMesh so thousands of objects cost ~nothing on the GPU.
 *
 * @param {THREE.Scene} scene
 * @param {(x:number, z:number) => number} getHeightAt
 * @param {(x:number, z:number) => boolean} isOnTrack
 * @returns {{ group: THREE.Group, treePositions: THREE.Vector3[] }}
 */
export function addEnvironmentDetail(scene, getHeightAt, isOnTrack) {
  const group = new THREE.Group()
  const treePositions = []

  // ---------- TREE ----------
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 6)
  trunkGeo.translate(0, 0.6, 0)
  const trunkMat = Materials.bark()

  const leavesGeo = new THREE.ConeGeometry(0.9, 2.4, 7)
  leavesGeo.translate(0, 2.0, 0)
  const leavesMat = Materials.foliage()

  const TREE_COUNT = 400
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, TREE_COUNT)
  const leavesMesh = new THREE.InstancedMesh(leavesGeo, leavesMat, TREE_COUNT)
  trunkMesh.castShadow = true
  leavesMesh.castShadow = true
  leavesMesh.receiveShadow = true

  const dummy = new THREE.Object3D()
  let placed = 0
  let attempts = 0

  while (placed < TREE_COUNT && attempts < TREE_COUNT * 20) {
    attempts++
    const x = (Math.random() - 0.5) * 140
    const z = (Math.random() - 0.5) * 140
    if (isOnTrack(x, z)) continue

    const y = getHeightAt(x, z)
    const scale = 0.8 + Math.random() * 0.6
    const rotY = Math.random() * Math.PI * 2

    dummy.position.set(x, y, z)
    dummy.rotation.set(0, rotY, 0)
    dummy.scale.setScalar(scale)
    dummy.updateMatrix()

    trunkMesh.setMatrixAt(placed, dummy.matrix)
    leavesMesh.setMatrixAt(placed, dummy.matrix)

    const tint = 0.85 + Math.random() * 0.3
    leavesMesh.setColorAt(placed, new THREE.Color(0.18 * tint, 0.35 * tint, 0.2 * tint))

    treePositions.push(new THREE.Vector3(x, y, z))
    placed++
  }
  trunkMesh.count = placed
  leavesMesh.count = placed
  trunkMesh.instanceMatrix.needsUpdate = true
  leavesMesh.instanceMatrix.needsUpdate = true
  if (leavesMesh.instanceColor) leavesMesh.instanceColor.needsUpdate = true

  group.add(trunkMesh, leavesMesh)

  // ---------- ROCKS ----------
  const rockGeo = new THREE.DodecahedronGeometry(0.4, 0)
  const rockMat = Materials.rock()
  const ROCK_COUNT = 150
  const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, ROCK_COUNT)
  rockMesh.castShadow = true
  rockMesh.receiveShadow = true

  let rPlaced = 0, rAttempts = 0
  while (rPlaced < ROCK_COUNT && rAttempts < ROCK_COUNT * 20) {
    rAttempts++
    const x = (Math.random() - 0.5) * 130
    const z = (Math.random() - 0.5) * 130
    if (isOnTrack(x, z)) continue

    const y = getHeightAt(x, z)
    dummy.position.set(x, y + 0.15, z)
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    dummy.scale.setScalar(0.5 + Math.random() * 1.2)
    dummy.updateMatrix()
    rockMesh.setMatrixAt(rPlaced, dummy.matrix)
    rPlaced++
  }
  rockMesh.count = rPlaced
  rockMesh.instanceMatrix.needsUpdate = true
  group.add(rockMesh)

  // ---------- GRASS TUFTS ----------
  const tuftGeo = new THREE.ConeGeometry(0.06, 0.35, 3)
  tuftGeo.translate(0, 0.17, 0)
  const tuftMat = new THREE.MeshStandardMaterial({
    color: 0x4a7c3a, roughness: 1.0, flatShading: true, side: THREE.DoubleSide
  })
  const TUFT_COUNT = 600
  const tuftMesh = new THREE.InstancedMesh(tuftGeo, tuftMat, TUFT_COUNT)

  let tPlaced = 0, tAttempts = 0
  while (tPlaced < TUFT_COUNT && tAttempts < TUFT_COUNT * 10) {
    tAttempts++
    const x = (Math.random() - 0.5) * 100
    const z = (Math.random() - 0.5) * 100
    if (isOnTrack(x, z)) continue
    const y = getHeightAt(x, z)
    dummy.position.set(x, y, z)
    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0)
    dummy.scale.setScalar(0.7 + Math.random() * 0.8)
    dummy.updateMatrix()
    tuftMesh.setMatrixAt(tPlaced, dummy.matrix)
    tPlaced++
  }
  tuftMesh.count = tPlaced
  tuftMesh.instanceMatrix.needsUpdate = true
  group.add(tuftMesh)

  scene.add(group)
  return { group, treePositions }
}

/**
 * Generates a simple procedural ground texture with color variation.
 */
export function createGroundTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#3f6b34'
  ctx.fillRect(0, 0, size, size)

  const colors = ['#4a7c3a', '#365c2b', '#5c4a30', '#4f6b30']
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    ctx.globalAlpha = 0.15 + Math.random() * 0.2
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 10 + Math.random() * 40
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(40, 40)
  return texture
}
