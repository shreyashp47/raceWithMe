# Race With Me — GitHub Issues

Issues created at [github.com/shreyashp47/raceWithMe/issues](https://github.com/shreyashp47/raceWithMe/issues)

---

## Milestone 1: Project Setup & Basic Scene

### [Issue 1](https://github.com/shreyashp47/raceWithMe/issues/1): Initialize project structure
**Labels:** `setup`
**Body:**
- Create repo folder structure (`/src`, `/assets`, `/public`)
- Set up `index.html` with canvas element
- Add Three.js (or chosen engine) via CDN or npm
- Set up basic dev server (e.g., Vite or live-server)
- Acceptance: Blank page loads with a WebGL canvas, no console errors

### [Issue 2](https://github.com/shreyashp47/raceWithMe/issues/2): Set up basic 3D scene
**Labels:** `setup`, `rendering`
**Body:**
- Create scene, camera, renderer
- Add ground plane
- Add basic lighting (ambient + directional)
- Acceptance: Ground plane renders and camera can view it

---

## Milestone 2: Bike & Controls

### [Issue 3](https://github.com/shreyashp47/raceWithMe/issues/3): Add player bike model
**Labels:** `bike`
**Body:**
- Add placeholder bike mesh (box/cylinder or simple model)
- Position bike at start point on ground
- Acceptance: Bike visible in scene at spawn position

### [Issue 4](https://github.com/shreyashp47/raceWithMe/issues/4): Implement keyboard controls
**Labels:** `bike`, `controls`
**Body:**
- Arrow keys / WASD for accelerate, brake, steer left/right
- Basic velocity + rotation update per frame
- Acceptance: Bike moves and turns smoothly with keyboard input

### [Issue 5](https://github.com/shreyashp47/raceWithMe/issues/5): Add mobile touch controls
**Labels:** `controls`, `mobile`
**Body:**
- On-screen buttons/joystick for accelerate, brake, steer
- Show only on touch devices
- Acceptance: Bike controllable on mobile browser

---

## Milestone 3: Track & Environment

### [Issue 6](https://github.com/shreyashp47/raceWithMe/issues/6): Build race track with boundaries
**Labels:** `track`
**Body:**
- Design track path (road mesh or spline-based)
- Add visual track boundaries/edges
- Acceptance: Track renders as a continuous loop

### [Issue 7](https://github.com/shreyashp47/raceWithMe/issues/7): Add checkpoint & lap system
**Labels:** `track`, `gameplay`
**Body:**
- Place checkpoints along track
- Detect checkpoint crossing in correct order
- Track lap count per racer
- Acceptance: Lap counter increments correctly when player completes a loop

### [Issue 8](https://github.com/shreyashp47/raceWithMe/issues/8): Generate mountain terrain
**Labels:** `track`, `terrain`
**Body:**
- Add elevation/height variation to ground mesh (heightmap or procedural)
- Adjust bike speed based on slope (uphill slower, downhill faster)
- Acceptance: Bike visibly slows on uphill sections, speeds up downhill

### [Issue 9](https://github.com/shreyashp47/raceWithMe/issues/9): Add off-track terrain & traction system
**Labels:** `track`, `terrain`, `physics`
**Body:**
- Define off-track (grass/dirt) zones outside main path
- Reduce speed/traction when bike is off-track
- Acceptance: Bike behaves differently (slower, less responsive) off-track vs on-track

### [Issue 10](https://github.com/shreyashp47/raceWithMe/issues/10): Place trees and obstacles
**Labels:** `track`, `environment`
**Body:**
- Scatter tree models across track edges and off-track areas
- Ensure trees don't fully block shortcut paths
- Acceptance: Trees render correctly and are positioned sensibly

### [Issue 11](https://github.com/shreyashp47/raceWithMe/issues/11): Add collision detection with trees/obstacles
**Labels:** `physics`, `gameplay`
**Body:**
- Detect bike-tree collisions
- On collision: reduce speed / bounce back / minor crash animation
- Acceptance: Bike reacts correctly when hitting a tree

---

## Milestone 4: AI Bots

### [Issue 12](https://github.com/shreyashp47/raceWithMe/issues/12): Implement basic bot movement AI
**Labels:** `ai`
**Body:**
- Add 4 bot bikes that follow track waypoints
- Basic acceleration/steering logic toward next waypoint
- Acceptance: Bots move along the track without player input

### [Issue 13](https://github.com/shreyashp47/raceWithMe/issues/13): Add bot difficulty variation
**Labels:** `ai`
**Body:**
- Assign different speed/skill values to each bot (e.g., 1 easy, 2 medium, 1 hard)
- Acceptance: Bots finish race at noticeably different times based on difficulty

### [Issue 14](https://github.com/shreyashp47/raceWithMe/issues/14): Bot terrain & obstacle awareness
**Labels:** `ai`
**Body:**
- Bots slow down on mountain slopes
- Bots avoid trees where possible
- Acceptance: Bots don't repeatedly crash into trees or ignore slopes

---

## Milestone 5: HUD, UI & Race Flow

### [Issue 15](https://github.com/shreyashp47/raceWithMe/issues/15): Live attract-mode title screen
**Labels:** `ui`
**Body:**
- Instead of a static menu, run an AI-only race behind the menu with spectator camera cuts (arcade attract-mode)
- Title overlay on top of live race feed
- Press START to join
- Acceptance: Menu shows a live AI race playing in background until player presses start

### [Issue 16](https://github.com/shreyashp47/raceWithMe/issues/16): Live race HUD with gap + overtake alerts
**Labels:** `ui`
**Body:**
- Speed display
- Live time gap to the rider ahead
- Overtake pop-up notifications (e.g. "+1 PASS")
- Lap counter + race timer
- Boost meter (for future tricks/boost mechanics)
- Acceptance: HUD updates live during race with gap to next rider

### [Issue 17](https://github.com/shreyashp47/raceWithMe/issues/17): Start countdown
**Labels:** `ui`, `gameplay`
**Body:**
- 3-2-1-Go countdown before race starts
- Freeze bike controls until countdown ends
- Acceptance: Countdown displays and controls unlock only after "Go"

### [Issue 18](https://github.com/shreyashp47/raceWithMe/issues/18): Graded results screen with share card
**Labels:** `ui`, `gameplay`
**Body:**
- Graded rank stamp (F to A+) with one-word verdict
- Stats recap: top speed, biggest air, overtakes
- Share result card: generate a local image via canvas, hand to device share sheet or save as PNG
- Restart and Home (⌂) buttons
- Acceptance: Results screen displays grade, stats, and shareable card

### [Issue 19](https://github.com/shreyashp47/raceWithMe/issues/19): Top icon button row (replaces pause overlay)
**Labels:** `ui`
**Body:**
- Compact always-visible row of icon buttons (top-right corner):
  - 📺 CRT filter toggle
  - 👻 Ghost (best run) toggle
  - Mute
  - Restart
  - Home
  - ⛶ Fullscreen
- Esc key returns to title screen from any state
- Acceptance: Buttons visible during race, each toggle works without pausing game

### [Issue 24](https://github.com/shreyashp47/raceWithMe/issues/24): CRT/retro visual filter toggle
**Labels:** `ui`, `polish`
**Body:**
- CSS/Canvas post-process overlay: scanlines + vignette
- Toggle on/off via the CRT button in the top row
- Purely visual, no gameplay impact
- Acceptance: Toggle applies/removes CRT filter, game runs at same FPS

### [Issue 25](https://github.com/shreyashp47/raceWithMe/issues/25): Ghost replay (best run)
**Labels:** `ui`, `gameplay`
**Body:**
- Record player's best run (position data per frame)
- Store in localStorage
- Show as a transparent ghost bike when toggled on
- Acceptance: Ghost replays player's previous best lap, toggle shows/hides it

### [Issue 26](https://github.com/shreyashp47/raceWithMe/issues/26): Photo finish freeze frame
**Labels:** `ui`, `gameplay`
**Body:**
- Detect close finishes (within 0.5s of leader)
- Freeze screen briefly for dramatic moment before showing results
- Acceptance: Close races trigger a 1-2s freeze frame

### [Issue 27](https://github.com/shreyashp47/raceWithMe/issues/27): Mobile touch controls (auto-detect + landscape prompt)
**Labels:** `controls`, `mobile`
**Body:**
- On touch devices: auto-show virtual controls
- Left thumb: steer + brake
- Right thumb: jump, tricks, punch/kick, boost
- Landscape rotation prompt if device is portrait
- Acceptance: Touch controls appear on mobile, steer and action buttons work

---

## Milestone 6: Audio & Polish (Optional)

### [Issue 20](https://github.com/shreyashp47/raceWithMe/issues/20): Add background music and SFX
**Labels:** `audio`, `polish`
**Body:**
- Background music loop
- Engine sound, collision sound effects
- Acceptance: Sounds play at appropriate times without overlap issues

### [Issue 21](https://github.com/shreyashp47/raceWithMe/issues/21): Performance optimization pass
**Labels:** `polish`
**Body:**
- Profile and optimize for 60 FPS on mid-range hardware
- Reduce draw calls, optimize tree instancing
- Acceptance: Stable 60 FPS in test environment

---

## Milestone 7: Deployment

### [Issue 22](https://github.com/shreyashp47/raceWithMe/issues/22): Deploy to GitHub Pages
**Labels:** `deployment`
**Body:**
- Configure repo for GitHub Pages (branch/folder source)
- Verify live game loads correctly at public URL
- Acceptance: Game playable at `https://<username>.github.io/<repo-name>`

### [Issue 23](https://github.com/shreyashp47/raceWithMe/issues/23): Mirror deployment to itch.io (optional)
**Labels:** `deployment`
**Body:**
- Package build as HTML5 zip
- Upload to itch.io with game page description and thumbnail
- Acceptance: Game playable on itch.io page
