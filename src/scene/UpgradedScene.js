import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export function createUpgradedScene(canvasContainer) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.outputColorSpace = THREE.SRGBColorSpace

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  canvasContainer.prepend(renderer.domElement)

  const skyColor = 0x9fd4f0
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(skyColor)
  scene.fog = new THREE.Fog(skyColor, 30, 180)

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
  pmremGenerator.dispose()

  function addLighting() {
    const hemi = new THREE.HemisphereLight(0xaee2ff, 0x4a3a2a, 0.6)
    scene.add(hemi)

    const sun = new THREE.DirectionalLight(0xfff4e0, 2.2)
    sun.position.set(40, 60, 20)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -60
    sun.shadow.camera.right = 60
    sun.shadow.camera.top = 60
    sun.shadow.camera.bottom = -60
    sun.shadow.camera.far = 200
    sun.shadow.bias = -0.0005
    scene.add(sun)
    scene.add(sun.target)

    const rim = new THREE.DirectionalLight(0x88aaff, 0.4)
    rim.position.set(-30, 20, -40)
    scene.add(rim)

    return { hemi, sun, rim }
  }

  return { renderer, scene, addLighting }
}

export function resizeUpgradedScene(renderer, camera) {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
}
