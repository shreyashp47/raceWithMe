import * as THREE from 'three'
import { ChaseCamera } from './camera/ChaseCamera.js'
import { createUpgradedScene, resizeUpgradedScene } from './scene/UpgradedScene.js'
import { Bike } from './objects/Bike.js'
import { KeyboardControls } from './controls/KeyboardControls.js'
import { TouchControls } from './controls/TouchControls.js'
import { Track } from './track/Track.js'
import { LapManager } from './track/LapManager.js'
import { Terrain } from './terrain/Terrain.js'
import { addEnvironmentDetail, createGroundTexture } from './environment/EnvironmentDetail.js'
import { colorTerrainByElevation, createTerrainMaterial } from './environment/AlpineTerrain.js'
import { AiBot } from './ai/AiBot.js'
import { GameState } from './ui/GameState.js'
import { Menu } from './ui/Menu.js'
import { AudioManager } from './audio/AudioManager.js'
import { CrtFilter } from './ui/CrtFilter.js'
import { GhostReplay } from './ui/GhostReplay.js'
import { PhotoFinish } from './ui/PhotoFinish.js'

let state = GameState.MENU
let scene, camera, renderer
let bike, track, terrain, trees, bots, lapManager
let keyboard, touch, input, clock
let audio, crt, ghost, photoFinish
let chaseCam
let hud, countdownEl, resultsEl, topBar, topBarBtns
let hudTimer = 0
let overtakeNotif = null


function initScene() {
  const upgraded = createUpgradedScene(document.body)
  renderer = upgraded.renderer
  scene = upgraded.scene
  upgraded.addLighting()

  camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.3, 330)
  camera.position.set(0, 5, 12)

  track = new Track()
  scene.add(track.mesh)
  terrain = new Terrain(120, 80, track.spline)
  colorTerrainByElevation(terrain.geometry)
  terrain.mesh.material = createTerrainMaterial()
  scene.add(terrain.mesh)

  const isOnTrack = (x, z) => {
    let minDist = Infinity
    for (let t = 0; t <= 1; t += 0.02) {
      const p = track.spline.getPoint(t)
      const d = Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2)
      if (d < minDist) minDist = d
    }
    return minDist < track.width * 0.6
  }
  const env = addEnvironmentDetail(scene, (x, z) => terrain.getHeight(x, z), isOnTrack)
  trees = env.treePositions

  keyboard = new KeyboardControls()
  touch = new TouchControls()
  input = { get keys() { return { ...keyboard.keys, ...touch.keys } } }
  clock = new THREE.Clock()
}

function createBots() {
  const colors = [0x3366ff, 0x33cc33, 0xffaa00, 0xcc33cc]
  const diffs = [
    { maxSpeed: 6, acceleration: 5 },
    { maxSpeed: 7, acceleration: 6 },
    { maxSpeed: 8, acceleration: 7 },
    { maxSpeed: 9, acceleration: 8 },
  ]
  const bs = []
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) * 0.03
    const p = track.spline.getPoint(t)
    p.y = 0.35
    bs.push(new AiBot(track, diffs[i], p, colors[i]))
    scene.add(bs[i].mesh)
  }
  return bs
}

function setupPlayerBike() {
  if (bike) scene.remove(bike.mesh)
  const startP = track.spline.getPoint(0)
  const startTangent = track.spline.getTangent(0)
  bike = new Bike(0xff4400)
  bike.maxSpeed = 18
  bike.acceleration = 12
  bike.mesh.position.set(startP.x, 0.35, startP.z)
  bike.mesh.rotation.y = Math.atan2(startTangent.x, startTangent.z)
  scene.add(bike.mesh)
}

function createUI() {
  const fl = document.createElement('link')
  fl.rel = 'stylesheet'
  fl.href = 'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Teko:wght@500;700&display=swap'
  document.head.appendChild(fl)

  const uiStyle = document.createElement('style')
  uiStyle.textContent = `
    #hud { position:fixed;inset:0;pointer-events:none;z-index:10;display:none; }

    #hud-speed { position:absolute;right:18px;bottom:18px;text-align:right; }
    #hud-speed .num { font-family:'Black Ops One',cursive; font-size:72px; color:#fff;
      text-shadow:3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; line-height:0.8; }
    #hud-speed .unit { font-family:Teko,sans-serif; font-size:20px; color:#ff9922; letter-spacing:2px;
      text-shadow:2px 2px 0 #000; display:block; margin-top:-4px; }

    #hud-lap { position:absolute;top:14px;left:50%;transform:translateX(-50%);
      font-family:Teko,sans-serif; font-size:28px; color:#ff9922; letter-spacing:3px;
      text-shadow:2px 2px 0 #000; background:rgba(0,0,0,0.4); padding:2px 16px; border:1px solid rgba(255,255,255,0.15); }
    #hud-lap span { color:#fff; }

    #hud-pos { position:absolute;top:14px;left:14px;
      font-family:'Black Ops One',cursive; font-size:32px; color:#fff;
      text-shadow:3px 3px 0 #000; line-height:1; }
    #hud-pos .tag { font-family:Teko,sans-serif; font-size:14px; color:#ff9922; letter-spacing:2px;
      text-shadow:2px 2px 0 #000; display:block; margin-top:-2px; }

    #hud-gap { position:absolute;top:56px;left:50%;transform:translateX(-50%);
      font-family:Teko,sans-serif; font-size:18px; color:#fff;
      text-shadow:2px 2px 0 #000; background:rgba(0,0,0,0.35); padding:1px 12px; }
    #hud-gap b { color:#ffd23f; }

    #hud-overtake { position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);
      font-family:'Black Ops One',cursive; font-size:42px; color:#ffd23f;
      text-shadow:4px 4px 0 #000; animation:fadeUp 1.2s ease-out forwards; }
    @keyframes fadeUp { 0%{opacity:1;transform:translate(-50%,-50%) scale(0.8);}
      15%{opacity:1;transform:translate(-50%,-50%) scale(1.1);}
      30%{transform:translate(-50%,-50%) scale(1);}
      70%{opacity:1;} 100%{opacity:0;transform:translate(-50%,-70%) scale(1);} }

    #countdown { position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:20;pointer-events:none; }
    #countdown span { font-family:'Black Ops One',cursive; font-size:160px; color:#ff4400;
      text-shadow:6px 6px 0 #000, 12px 12px 0 rgba(0,0,0,0.4); animation:countPop 0.7s ease-out; }
    @keyframes countPop { 0%{transform:scale(2);opacity:0;} 40%{transform:scale(1);opacity:1;} 100%{opacity:1;} }
    #countdown .go { color:#59ff7a; font-size:120px; }

    #topbar { position:fixed;top:8px;right:8px;display:none;gap:4px;z-index:30; }
    #topbar button { width:36px;height:36px;border-radius:6px;
      border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.5);
      color:#fff;font-size:15px;cursor:pointer;pointer-events:auto;
      backdrop-filter:blur(4px); transition:background 0.15s; }
    #topbar button:hover { background:rgba(255,255,255,0.15); }

    #results { position:fixed;inset:0;display:none;flex-direction:column;align-items:center;
      justify-content:center;z-index:40;font-family:Teko,sans-serif;
      background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%); }
    #results .panel { background:rgba(0,0,0,0.7); border:3px solid #fff;
      box-shadow:8px 8px 0 rgba(0,0,0,0.6); padding:24px 36px; min-width:360px; text-align:center; position:relative; }
    #results .grade { font-family:'Black Ops One',cursive; font-size:80px; line-height:1;
      text-shadow:4px 4px 0 #000; }
    #results .grade.Aplus { color:#ffd23f; } #results .grade.A { color:#59ff7a; }
    #results .grade.B { color:#6fc3ff; } #results .grade.C { color:#fff; }
    #results .grade.D { color:#ff7a6f; } #results .grade.F { color:#ff4444; }
    #results .verdict { font-size:30px; letter-spacing:6px; color:#ffd23f;
      text-shadow:2px 2px 0 #000; margin-top:-4px; }
    #results .stats { font-size:20px; color:#cfe3ff; line-height:1.8; margin-top:10px;
      text-shadow:2px 2px 0 #000; }
    #results .stats span { color:#ffd23f; }
    #results button { padding:8px 28px; font-family:Teko,sans-serif; font-size:22px; letter-spacing:2px;
      color:#fff; border:2px solid #fff; cursor:pointer; transition:background 0.15s; }
    #results .btn-restart { background:#ff4400; }
    #results .btn-restart:hover { background:#cc3300; }
    #results .btn-home { background:rgba(80,140,255,0.3); }
    #results .btn-home:hover { background:rgba(80,140,255,0.5); }
    #results .btns { display:flex; gap:12px; justify-content:center; margin-top:14px; }
  `
  document.head.appendChild(uiStyle)

  hud = document.createElement('div')
  hud.id = 'hud'
  hud.innerHTML = `
    <div id="hud-speed"><div class="num" id="hud-speed-val">0</div><div class="unit">KM/H</div></div>
    <div id="hud-lap">LAP <span id="hud-lap-val">1/3</span></div>
    <div id="hud-pos"><span id="hud-pos-val">1</span><span class="tag">POS</span></div>
    <div id="hud-gap"></div>
  `
  document.body.appendChild(hud)

  countdownEl = document.createElement('div')
  countdownEl.id = 'countdown'
  countdownEl.innerHTML = '<span id="cd-text">3</span>'
  document.body.appendChild(countdownEl)

  resultsEl = document.createElement('div')
  resultsEl.id = 'results'
  document.body.appendChild(resultsEl)
}

function createTopBar() {
  topBar = document.createElement('div')
  topBar.id = 'topbar'
  topBar.innerHTML = `
    <button data-action="crt">📺</button>
    <button data-action="ghost">👻</button>
    <button data-action="mute">🔊</button>
    <button data-action="restart">↻</button>
    <button data-action="home">⌂</button>
    <button data-action="fs">⛶</button>
  `
  document.body.appendChild(topBar)

  topBarBtns = {}
  topBar.querySelectorAll('button').forEach(b => {
    const action = b.dataset.action
    topBarBtns[action] = b
    b.onclick = () => handleTopBarAction(action)
  })
}

function handleTopBarAction(action) {
  switch (action) {
    case 'crt': crt.toggle(); break
    case 'ghost': ghost.toggle(); break
    case 'mute':
      // audio.muted = !audio.muted
      // topBarBtns.mute.textContent = audio.muted ? '🔇' : '🔊'
      break
    case 'restart':
      setupRace()
      startCountdown()
      break
    case 'home':
      state = GameState.MENU
      showMenu()
      break
    case 'fs':
      if (!document.fullscreenElement) document.documentElement.requestFullscreen()
      else document.exitFullscreen()
      break
  }
}

function showMenu() {
  document.body.innerHTML = ''
  scene = null
  state = GameState.MENU
  const menu = new Menu(() => {
    menu.remove()
    initGame()
  })
}

function initGame() {
  // audio = new AudioManager()
  // audio.resume()
  // audio.startEngine()
  // audio.startBgMusic()
  initScene()
  crt = new CrtFilter()
  ghost = new GhostReplay(scene)
  photoFinish = new PhotoFinish()
  createUI()
  createTopBar()
  setupRace()
  startCountdown()
  animate()
}

function setupRace() {
  setupPlayerBike()
  bots = createBots()
  lapManager = new LapManager(track.checkpoints)
  ghost.startRecording()
  clock.start()
  chaseCam = new ChaseCamera(camera)
}

function startCountdown() {
  state = GameState.COUNTDOWN
  hud.style.display = 'none'
  topBar.style.display = 'none'
  countdownEl.style.display = 'flex'
  const cdText = document.getElementById('cd-text')
  let val = 4
  cdText.textContent = '3'
  cdText.className = ''
  const iv = setInterval(() => {
    val--
    if (val > 0) { cdText.textContent = val; cdText.className = '' }
    else if (val === 0) { cdText.textContent = 'GO!'; cdText.className = 'go' }
    else {
      clearInterval(iv)
      countdownEl.style.display = 'none'
      state = GameState.RACING
      hud.style.display = 'block'
      topBar.style.display = 'flex'
      hudTimer = 0
    }
  }, 800)
}

function getPlayerPosition() {
  if (!lapManager || !bots) return 1
  const pp = lapManager.position
  let ahead = 1
  for (const bot of bots) {
    if (bot.progress > pp) ahead++
  }
  return ahead
}

function getGapToPrev() {
  if (!lapManager || !bots) return null
  const playerPos = lapManager.position
  let minGap = null
  for (const bot of bots) {
    if (bot.progress > playerPos) {
      const gap = (bot.progress - playerPos) * 100
      if (minGap === null || gap < minGap) minGap = gap
    }
  }
  if (minGap === null) {
    for (const bot of bots) {
      const gap = (bot.progress - playerPos) * 100
      if (minGap === null || gap > minGap) minGap = -gap
    }
    return { gap: Math.abs(minGap), ahead: false }
  }
  return { gap: minGap, ahead: true }
}

function animate() {
  requestAnimationFrame(animate)
  const dt = Math.min(clock.getDelta(), 0.05)

  if (state === GameState.COUNTDOWN) return

  if (state === GameState.RACING || state === GameState.MENU) {
    if (bike && state === GameState.RACING) {
      bike.update(input.keys, dt, track, terrain, trees, null, () => chaseCam?.shake(0.3))

      const oldLap = lapManager.currentLap
      const oldCp = lapManager.nextCheckpoint
      lapManager.check(bike.mesh.position)

      if (lapManager.nextCheckpoint !== oldCp && lapManager.currentLap === oldLap) {
        showOvertakeNotif()
      }

      ghost.recordFrame(bike.mesh.position, bike.mesh.rotation)

      hudTimer += dt
      const gapInfo = getGapToPrev()
      const gapStr = gapInfo ? `${gapInfo.ahead ? '-' : '+'}${gapInfo.gap.toFixed(1)}s` : '--'

      document.getElementById('hud-speed-val').textContent = Math.round(bike.speed * 10)
      document.getElementById('hud-lap-val').textContent = `${lapManager.currentLap}/${lapManager.totalLaps}`
      const pos = getPlayerPosition()
      document.getElementById('hud-pos-val').textContent = pos
      const gapEl = document.getElementById('hud-gap')
      if (overtakeNotif && hudTimer < overtakeNotif.time + 2) {
        gapEl.innerHTML = '<b>+1 PASS</b>'
      } else {
        gapEl.innerHTML = gapStr ? `GAP <b>${gapStr}</b>` : ''
      }

      if (lapManager.finished) {
        const isClose = gapInfo && gapInfo.gap < 0.5
        if (isClose) {
          photoFinish.trigger(() => showResults())
        } else {
          showResults()
        }
      }
    }

    if (bots) bots.forEach(b => b.update(dt, terrain))
    ghost.update()
    if (bike && chaseCam) chaseCam.update(bike.mesh, bike.speed, bike.maxSpeed, dt)
  }

  if (photoFinish.freezing) {
    if (photoFinish.update(dt)) return
  }

  if (state === GameState.RACING || state === GameState.MENU) {
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
}

function showOvertakeNotif() {
  overtakeNotif = { text: '+1 PASS', time: hudTimer }
  setTimeout(() => { overtakeNotif = null }, 2000)
}

function gradeRace() {
  const s = bike ? Math.round(bike.speed * 10) : 0
  if (s > 95) return { grade: 'A+', verdict: 'DOMINATION' }
  if (s > 80) return { grade: 'A', verdict: 'SUPERB' }
  if (s > 65) return { grade: 'B', verdict: 'SOLID' }
  if (s > 50) return { grade: 'C', verdict: 'DECENT' }
  if (s > 35) return { grade: 'D', verdict: 'SHAKY' }
  return { grade: 'F', verdict: 'RERUN' }
}

function showResults() {
  state = GameState.RESULTS
  hud.style.display = 'none'
  topBar.style.display = 'none'
  const grade = gradeRace()
  const gradeClass = grade.grade === 'A+' ? 'Aplus' : grade.grade
  const pos = getPlayerPosition()
  resultsEl.innerHTML = `
    <div class="panel">
      <div class="grade ${gradeClass}">${grade.grade}</div>
      <div class="verdict">${grade.verdict}</div>
      <div class="stats">
        POSITION <span>${pos}/5</span><br>
        TOP SPEED <span>${Math.round(bike?.speed * 10 || 0)}</span> KM/H<br>
        LAPS <span>${lapManager.currentLap}/${lapManager.totalLaps}</span>
      </div>
      <div class="btns">
        <button class="btn-restart" id="r-restart">RESTART</button>
        <button class="btn-home" id="r-home">HOME</button>
      </div>
    </div>
  `
  resultsEl.style.display = 'flex'
  resultsEl.querySelector('#r-restart').onclick = () => {
    resultsEl.style.display = 'none'
    setupRace()
    startCountdown()
  }
  resultsEl.querySelector('#r-home').onclick = () => {
    resultsEl.style.display = 'none'
    ghost.recording = false
    document.body.innerHTML = ''
    scene = null
    state = GameState.MENU
    const menu = new Menu(() => { menu.remove(); initGame() })
  }
}

window.addEventListener('resize', () => {
  if (camera) resizeUpgradedScene(renderer, camera)
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state === GameState.RACING) {
    state = GameState.MENU
    document.body.innerHTML = ''
    scene = null
    const menu = new Menu(() => { menu.remove(); initGame() })
  }
})

const menu = new Menu(() => {
  menu.remove()
  initGame()
})
