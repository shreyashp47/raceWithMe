export class CrtFilter {
  el
  active = false
  styleEl

  constructor() {
    this.el = document.createElement('div')
    this.el.id = 'crt-overlay'
    this.el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;display:none'

    this.styleEl = document.createElement('style')
    this.styleEl.textContent = `
      #crt-overlay {
        background: repeating-linear-gradient(
          0deg,
          rgba(0,0,0,0.08) 0px,
          rgba(0,0,0,0.08) 1px,
          transparent 1px,
          transparent 3px
        );
      }
      #crt-overlay::after {
        content:'';position:fixed;inset:0;
        background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%);
      }
    `
    document.head.appendChild(this.styleEl)
    document.body.appendChild(this.el)
  }

  toggle() {
    this.active = !this.active
    this.el.style.display = this.active ? 'block' : 'none'
  }
}
