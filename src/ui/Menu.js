export class Menu {
  el

  constructor(onStart) {
    this.el = document.createElement('div')
    this.el.id = 'menu'
    this.el.innerHTML = `
      <div id="menu-bg"></div>
      <div id="menu-content">
        <div id="logo">
          <div class="l1">RACE</div>
          <div class="l2">WITH ME</div>
        </div>
        <div id="tag">MOTORCYCLE RACING</div>
        <button id="start-btn">START RACE</button>
        <div id="controls">
          <span><b>W</b> / <b>↑</b> Accelerate</span>
          <span><b>S</b> / <b>↓</b> Brake</span>
          <span><b>A</b> / <b>←</b> Steer Left</span>
          <span><b>D</b> / <b>→</b> Steer Right</span>
        </div>
        <div id="press-enter">PRESS START</div>
      </div>
    `
    document.body.appendChild(this.el)

    const style = document.createElement('style')
    style.textContent = `
      #menu {
        position:fixed;inset:0;z-index:200;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        font-family:"Arial Black","Arial Bold",Impact,sans-serif;
        text-transform:uppercase;
      }
      #menu-bg {
        position:absolute;inset:0;
        background:linear-gradient(180deg,#0a0e1a 0%,#1a0e0a 50%,#0a0e1a 100%);
      }
      #menu-bg::after {
        content:'';position:absolute;inset:0;
        background:radial-gradient(ellipse at 50% 30%, rgba(255,68,0,0.15) 0%, transparent 70%);
      }
      #menu-content {
        position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;
        text-shadow:3px 3px 0 rgba(0,0,0,0.9);
      }
      #logo { text-align:center; line-height:0.85; transform:skewX(-6deg) rotate(-2deg); }
      #logo .l1 { font-size:min(12vw,72px); color:#fff; letter-spacing:4px; }
      #logo .l2 { font-size:min(18vw,120px); color:#ff4400; letter-spacing:-2px;
        text-shadow:4px 4px 0 #000, 8px 8px 0 rgba(0,0,0,0.5); }
      #tag { font-size:14px; color:#ff9922; letter-spacing:6px; margin-top:4px; font-style:italic; }
      #start-btn {
        margin-top:16px;padding:12px 48px;font-size:20px;
        font-family:"Arial Black",sans-serif;text-transform:uppercase;letter-spacing:3px;
        background:#ff4400;color:#fff;border:2px solid #fff;
        box-shadow:4px 4px 0 rgba(0,0,0,0.8);cursor:pointer;
      }
      #start-btn:hover { background:#cc3300; }
      #controls {
        margin-top:16px;display:grid;grid-template-columns:auto auto;gap:4px 16px;
        font-size:13px;color:#aa8877;font-style:italic;font-weight:normal;
        background:rgba(0,0,0,0.5);padding:10px 16px;border:1px solid rgba(255,255,255,0.15);
      }
      #controls b { color:#ff9922; }
      #press-enter {
        margin-top:20px;font-size:18px;color:#fff;letter-spacing:4px;
        animation:blink 1.1s steps(2) infinite;
      }
      @keyframes blink { 50% { opacity:0.15; } }
    `
    document.head.appendChild(style)

    this.el.querySelector('#start-btn').onclick = onStart
  }

  remove() {
    this.el.remove()
  }
}
