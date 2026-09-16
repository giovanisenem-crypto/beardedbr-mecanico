(() => {
  'use strict';
  const W = 1672, H = 941;
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;

  const ui = {
    loading: document.querySelector('#loading'), intro: document.querySelector('#intro'),
    hud: document.querySelector('#hud'), controls: document.querySelector('#controls'),
    status: document.querySelector('#status'), message: document.querySelector('#message'),
    messageText: document.querySelector('#message div')
  };
  const bg = new Image();
  const heroSheet = new Image();
  let loaded = 0;
  const ready = () => { if (++loaded === 2) setTimeout(() => { ui.loading.classList.add('hidden'); ui.intro.classList.remove('hidden'); draw(); }, 850); };
  bg.onload = ready; heroSheet.onload = ready;
  bg.src = 'art/forge_stage.webp';
  heroSheet.src = 'art/mechanic_sheet.webp';

  const platforms = [
    { x1: 0, x2: 570, y: 548 },
    { x1: 665, x2: 1007, y: 548 },
    { x1: 1100, x2: W, y: 548 }
  ];
  const spawn = { x: 165, y: 548 };
  const player = { x: spawn.x, y: spawn.y, vx: 0, vy: 0, w: 88, h: 210, grounded: true, facing: 1, frame: 0, runClock: 0 };
  const keys = { left: false, right: false, jump: false };
  let playing = false, paused = false, last = 0, deaths = 0, won = false;

  function reset(showText = false) {
    player.x = spawn.x; player.y = spawn.y; player.vx = 0; player.vy = 0; player.grounded = true; player.frame = 0;
    won = false; ui.status.textContent = `SETOR 01 · QUEDAS ${deaths}`;
    if (showText) flash('QUEDA — VOLTANDO AO PONTO SEGURO', 900);
  }
  function flash(text, ms = 1000) {
    ui.messageText.textContent = text; ui.message.classList.remove('hidden');
    clearTimeout(flash.timer); flash.timer = setTimeout(() => ui.message.classList.add('hidden'), ms);
  }
  function platformBelow(prevFoot, nextFoot) {
    if (player.vy < 0) return null;
    const left = player.x - player.w * .32, right = player.x + player.w * .32;
    return platforms.find(p => right > p.x1 && left < p.x2 && prevFoot <= p.y + 5 && nextFoot >= p.y);
  }
  function update(dt) {
    if (!playing || paused) return;
    const accel = player.grounded ? 2550 : 1600;
    const target = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (target) { player.vx += target * accel * dt; player.facing = target; }
    else player.vx *= Math.pow(player.grounded ? .0008 : .08, dt);
    player.vx = Math.max(-405, Math.min(405, player.vx));
    if (keys.jump && player.grounded) { player.vy = -790; player.grounded = false; keys.jump = false; }

    const prevFoot = player.y;
    player.x += player.vx * dt;
    player.vy += 1880 * dt;
    player.y += player.vy * dt;
    player.x = Math.max(42, Math.min(W - 42, player.x));
    const floor = platformBelow(prevFoot, player.y);
    if (floor) { player.y = floor.y; player.vy = 0; player.grounded = true; }
    else if (player.grounded) {
      const supported = platforms.some(p => player.x + player.w * .27 > p.x1 && player.x - player.w * .27 < p.x2 && Math.abs(player.y - p.y) < 8);
      if (!supported) player.grounded = false;
    }

    if (player.y > H + 180) { deaths++; reset(true); }
    if (!won && player.x > 1500 && player.grounded) { won = true; flash('TESTE CONCLUÍDO!', 1600); ui.status.textContent = `SETOR 01 CONCLUÍDO · QUEDAS ${deaths}`; }

    if (!player.grounded) player.frame = player.vy < -120 ? 5 : player.vy > 240 ? 6 : 4;
    else if (Math.abs(player.vx) > 40) { player.runClock += dt * (7 + Math.abs(player.vx) / 100); player.frame = 1 + (Math.floor(player.runClock) % 3); }
    else player.frame = 0;
  }
  function drawHero() {
    const cols = 4, rows = 2;
    const sw = heroSheet.width / cols, sh = heroSheet.height / rows;
    const f = Math.max(0, Math.min(7, player.frame));
    const sx = (f % cols) * sw, sy = Math.floor(f / cols) * sh;
    const dh = player.h * (f === 7 ? .93 : 1), dw = sw / sh * dh;
    ctx.save(); ctx.translate(player.x, player.y);
    if (player.facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(heroSheet, sx, sy, sw, sh, -dw / 2, -dh, dw, dh);
    ctx.restore();
  }
  function draw() {
    ctx.drawImage(bg, 0, 0, W, H);
    if (heroSheet.complete) drawHero();
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 1000);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,.24)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  }
  function loop(t) {
    const dt = Math.min(.034, (t - last) / 1000 || 0); last = t;
    update(dt); draw(); requestAnimationFrame(loop);
  }

  function bindHold(id, key) {
    const el = document.querySelector(id);
    const on = e => { e.preventDefault(); keys[key] = true; el.classList.add('pressed'); };
    const off = e => { e.preventDefault(); keys[key] = false; el.classList.remove('pressed'); };
    ['pointerdown','touchstart'].forEach(n => el.addEventListener(n, on, { passive: false }));
    ['pointerup','pointercancel','pointerleave','touchend','touchcancel'].forEach(n => el.addEventListener(n, off, { passive: false }));
  }
  bindHold('#left','left'); bindHold('#right','right'); bindHold('#jump','jump');
  document.querySelector('#start').addEventListener('click', () => {
    ui.intro.classList.add('hidden'); ui.hud.classList.remove('hidden'); ui.controls.classList.remove('hidden');
    reset(); playing = true; flash('SALTE SOBRE OS BURACOS', 1200);
  });
  document.querySelector('#pause').addEventListener('click', () => { paused = !paused; flash(paused ? 'PAUSADO' : 'CONTINUAR', 700); });
  addEventListener('keydown', e => { if (e.key === 'ArrowLeft') keys.left = true; if (e.key === 'ArrowRight') keys.right = true; if (['ArrowUp',' '].includes(e.key)) keys.jump = true; });
  addEventListener('keyup', e => { if (e.key === 'ArrowLeft') keys.left = false; if (e.key === 'ArrowRight') keys.right = false; });
  window.ForjaGame = { back() { if (playing) { paused = true; flash('PAUSADO'); return true; } return false; } };
  requestAnimationFrame(loop);
})();
