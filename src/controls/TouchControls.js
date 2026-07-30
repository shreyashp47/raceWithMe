export class TouchControls {
  keys = {}

  constructor() {
    const left = document.createElement('div')
    left.id = 'touch-left'
    left.innerHTML = `
      <button data-key="arrowup" class="touch-btn up">↑</button>
      <button data-key="arrowdown" class="touch-btn down">↓</button>
    `
    document.body.appendChild(left)

    const right = document.createElement('div')
    right.id = 'touch-right'
    right.innerHTML = `
      <button data-key="arrowleft" class="touch-btn left">←</button>
      <button data-key="arrowright" class="touch-btn right">→</button>
    `
    document.body.appendChild(right)

    const style = document.createElement('style')
    style.textContent = `
      #touch-left {
        position: fixed; bottom: 40px; left: 20px;
        display: none; flex-direction: column; gap: 8px;
        pointer-events: none; z-index: 100;
      }
      #touch-right {
        position: fixed; bottom: 40px; right: 20px;
        display: none; flex-direction: row; gap: 8px;
        pointer-events: none; z-index: 100;
      }
      .touch-btn {
        width: 64px; height: 64px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.6);
        background: rgba(255,255,255,0.15);
        color: #fff; font-size: 22px;
        pointer-events: auto; cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none; touch-action: none;
      }
      .touch-btn:active {
        background: rgba(255,255,255,0.35);
      }

      @media (pointer: coarse) {
        #touch-left { display: flex; }
        #touch-right { display: flex; }
      }
    `
    document.head.appendChild(style)

    document.querySelectorAll('.touch-btn').forEach(btn => {
      const key = btn.getAttribute('data-key')

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault()
        this.keys[key] = true
        btn.classList.add('active')
      })
      btn.addEventListener('touchend', (e) => {
        e.preventDefault()
        this.keys[key] = false
        btn.classList.remove('active')
      })
      btn.addEventListener('touchcancel', () => {
        this.keys[key] = false
        btn.classList.remove('active')
      })

      btn.addEventListener('mousedown', () => { this.keys[key] = true })
      btn.addEventListener('mouseup', () => { this.keys[key] = false })
      btn.addEventListener('mouseleave', () => { this.keys[key] = false })
    })
  }
}