export class TouchControls {
  keys = {}
  el

  constructor() {
    this.el = document.createElement('div')
    this.el.id = 'touch-controls'
    this.el.innerHTML = `
      <button data-key="arrowup" class="touch-btn up">↑</button>
      <button data-key="arrowleft" class="touch-btn left">←</button>
      <button data-key="arrowdown" class="touch-btn down">↓</button>
      <button data-key="arrowright" class="touch-btn right">→</button>
    `
    document.body.appendChild(this.el)

    const style = document.createElement('style')
    style.textContent = `
      #touch-controls {
        position: fixed; bottom: 20px; left: 0; width: 100%;
        display: none; justify-content: center; gap: 12px;
        pointer-events: none; z-index: 100;
      }
      .touch-btn {
        width: 60px; height: 60px; border-radius: 50%;
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
        #touch-controls { display: flex; }
      }
    `
    document.head.appendChild(style)

    this.el.querySelectorAll('.touch-btn').forEach(btn => {
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
