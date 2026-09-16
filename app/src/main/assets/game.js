(() => {
  'use strict';
  const W = 1672, H = 941, WORLD_W = W * 7;
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  ctx.imageSmoothingEnabled = true;

  const ui = {
    loading: document.querySelector('#loading'), intro: document.querySelector('#intro'),
    hud: document.querySelector('#hud'), controls: document.querySelector('#controls'),
    status: document.querySelector('#status'), fps: document.querySelector('#fps'),
    message: document.querySelector('#message'), messageText: document.querySelector('#message div')
  };
  const backgroundSources = [
    'art/forge_stage.webp', 'art/forge_stage_02.webp', 'art/forge_stage_03.webp',
    'art/forge_stage_04.webp', 'art/forge_stage_05.webp', 'art/forge_stage_06.webp',
    'art/forge_stage_07.webp'
  ];
  const backgrounds = backgroundSources.map(() => new Image());
  const heroSheet = new Image();
  const pressSprite = new Image();
  let loaded = 0;
  const ready = () => {
    if (++loaded === backgrounds.length + 2) setTimeout(() => {
      ui.loading.classList.add('hidden'); ui.intro.classList.remove('hidden'); draw();
    }, 650);
  };
  backgrounds.forEach((image, i) => { image.onload = ready; image.src = backgroundSources[i]; });
  heroSheet.onload = ready; heroSheet.src = 'art/mechanic_sheet.webp';
  pressSprite.onload = ready; pressSprite.src = 'art/hydraulic_press.webp';

  // Every collider follows a visible steel surface in one of the seven background panels.
  const platforms = [
    { x1: 0, x2: 570, y: 548 }, { x1: 665, x2: 1007, y: 548 }, { x1: 1100, x2: W, y: 548 },
    { x1: W, x2: W + 455, y: 548 }, { x1: W + 598, x2: W + 1010, y: 548 }, { x1: W + 1220, x2: W * 2, y: 548 },
    { x1: W + 527, x2: W + 730, y: 281 }, { x1: W + 1044, x2: W + 1280, y: 281 },
    { x1: W * 2, x2: W * 2 + 470, y: 548 }, { x1: W * 2 + 620, x2: W * 2 + 1135, y: 548 }, { x1: W * 2 + 1270, x2: W * 3, y: 548 },
    { x1: W * 3, x2: W * 3 + 465, y: 548 }, { x1: W * 3 + 1160, x2: W * 4, y: 548 },
    { x1: W * 3 + 595, x2: W * 3 + 830, y: 417 }, { x1: W * 3 + 795, x2: W * 3 + 1040, y: 270 }, { x1: W * 3 + 955, x2: W * 3 + 1190, y: 418 },
    { x1: W * 4, x2: W * 4 + 378, y: 548 }, { x1: W * 4 + 480, x2: W * 4 + 798, y: 548 },
    { x1: W * 4 + 905, x2: W * 4 + 1232, y: 548 }, { x1: W * 4 + 1328, x2: W * 5, y: 548 },
    { x1: W * 4 + 640, x2: W * 4 + 900, y: 335 }, { x1: W * 4 + 1086, x2: W * 4 + 1350, y: 294 },
    { x1: W * 5, x2: W * 5 + 450, y: 548 }, { x1: W * 5 + 626, x2: W * 5 + 1105, y: 548 }, { x1: W * 5 + 1250, x2: W * 6, y: 548 },
    { x1: W * 5 + 1168, x2: W * 5 + 1415, y: 323 },
    { x1: W * 6, x2: W * 6 + 452, y: 548 }, { x1: W * 6 + 554, x2: W * 6 + 970, y: 548 }, { x1: W * 6 + 1083, x2: WORLD_W, y: 548 },
    { x1: W * 6 + 833, x2: W * 6 + 1122, y: 323 }
  ];
  const spawn = { x: 165, y: 548 };
  const checkpoints = [{ x: W * 2 + 918, y: 548 }, { x: W * 4 + 1118, y: 548 }];
  const presses = [{ x: W * 5 + 850, phase: 0, wasDown: false }];
  const player = { x: spawn.x, y: spawn.y, vx: 0, vy: 0, w: 88, h: 210, grounded: true, facing: 1, frame: 0, runClock: 0 };
  const keys = { left: false, right: false, jump: false };
  const sparks = Array.from({ length: 54 }, (_, i) => ({
    x: (i * 431) % WORLD_W, y: 260 + (i * 83) % 310, vx: 15 + (i % 5) * 9,
    vy: -42 - (i % 7) * 8, life: (i % 13) / 13, size: 2 + (i % 3)
  }));
  const smoke = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 617 + 300) % WORLD_W, y: 510 - (i % 4) * 48, phase: i * .7, size: 65 + (i % 4) * 24
  }));
  let playing = false, paused = false, last = 0, deaths = 0, won = false, cameraX = 0, checkpointIndex = -1;
  let pressClock = 0, shake = 0, audioContext = null, sirenOscillator = null, sirenGain = null;
  let fpsClock = 0, fpsFrames = 0;

  function pressState(press) {
    const t = (pressClock + press.phase) % 6;
    const restY = 135, impactY = 398;
    let footY = restY;
    if (t >= 4.4 && t < 4.7) {
      const k = (t - 4.4) / .3; footY = restY + (impactY - restY) * k * k * k;
    } else if (t >= 4.7 && t < 5.05) footY = impactY;
    else if (t >= 5.05) {
      const k = Math.min(1, (t - 5.05) / .95); footY = impactY - (impactY - restY) * k;
    }
    return { footY, bottom: footY + 150, warning: t >= 3.2 && t < 4.4, down: t >= 4.7 && t < 5.05 };
  }
  function initSiren() {
    if (audioContext) return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      sirenOscillator = audioContext.createOscillator(); sirenGain = audioContext.createGain();
      sirenOscillator.type = 'sine'; sirenGain.gain.value = 0;
      sirenOscillator.connect(sirenGain).connect(audioContext.destination); sirenOscillator.start();
    } catch (_) { audioContext = null; }
  }
  function updateSiren(warning) {
    if (!audioContext || !sirenGain || !sirenOscillator) return;
    const now = audioContext.currentTime;
    sirenGain.gain.setTargetAtTime(warning && !paused ? .012 : 0, now, .11);
    if (warning) sirenOscillator.frequency.setValueAtTime(430 + Math.sin(pressClock * 5) * 70, now);
  }

  function sector() { return Math.min(7, Math.floor(player.x / W) + 1); }
  function updateHud() {
    const names = ['PISO DE FUNDIÇÃO', 'PASSARELAS', 'LAMINAÇÃO', 'TORRE VERTICAL', 'LINHA DE FUNDIÇÃO', 'SALÃO DE PRENSAS', 'PORTÃO DA FORJA'];
    ui.status.textContent = `SETOR 0${sector()} · ${names[sector() - 1]} · QUEDAS ${deaths}`;
  }
  function reset(showText = false) {
    const safe = checkpointIndex >= 0 ? checkpoints[checkpointIndex] : spawn;
    player.x = safe.x; player.y = safe.y; player.vx = 0; player.vy = 0;
    player.grounded = true; player.frame = 0; cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * .28));
    won = false; updateHud();
    if (showText) flash(checkpointIndex >= 0 ? 'QUEDA — RETORNANDO AO CHECKPOINT' : 'QUEDA — VOLTANDO AO INÍCIO', 950);
  }
  function flash(text, ms = 1000) {
    ui.messageText.textContent = text; ui.message.classList.remove('hidden');
    clearTimeout(flash.timer); flash.timer = setTimeout(() => ui.message.classList.add('hidden'), ms);
  }
  function platformBelow(prevFoot, nextFoot) {
    if (player.vy < 0) return null;
    const left = player.x - player.w * .3, right = player.x + player.w * .3;
    return platforms.find(p => right > p.x1 && left < p.x2 && prevFoot <= p.y + 5 && nextFoot >= p.y);
  }
  function updateParticles(dt) {
    sparks.forEach(s => {
      s.life += dt * .48; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.life > 1 || s.y < 120) { s.life = 0; s.y = 570; s.x = (s.x + 739) % WORLD_W; }
    });
  }
  function update(dt) {
    updateParticles(dt);
    if (!playing || paused || won) return;
    pressClock += dt;
    shake *= Math.pow(.012, dt);
    if (shake < .2) shake = 0;
    const accel = player.grounded ? 2750 : 1750;
    const target = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (target) { player.vx += target * accel * dt; player.facing = target; }
    else player.vx *= Math.pow(player.grounded ? .0006 : .07, dt);
    player.vx = Math.max(-455, Math.min(455, player.vx));
    if (keys.jump && player.grounded) { player.vy = -1120; player.grounded = false; keys.jump = false; }

    const prevFoot = player.y;
    player.x += player.vx * dt; player.vy += 2100 * dt; player.y += player.vy * dt;
    player.x = Math.max(42, Math.min(WORLD_W - 42, player.x));
    const floor = platformBelow(prevFoot, player.y);
    if (floor) { player.y = floor.y; player.vy = 0; player.grounded = true; }
    else if (player.grounded) {
      const supported = platforms.some(p => player.x + player.w * .27 > p.x1 && player.x - player.w * .27 < p.x2 && Math.abs(player.y - p.y) < 8);
      if (!supported) player.grounded = false;
    }

    if (player.y > H + 180) { deaths++; updateSiren(false); reset(true); return; }
    const nextCheckpoint = checkpoints[checkpointIndex + 1];
    if (nextCheckpoint && player.x > nextCheckpoint.x - 70 && player.grounded) {
      checkpointIndex++; flash(`CHECKPOINT ${checkpointIndex + 1} ATIVADO`, 1300); updateHud();
    }
    let warningAudible = false, crushed = false;
    presses.forEach(press => {
      const state = pressState(press);
      if (state.warning && Math.abs(player.x - press.x) < W * .72) warningAudible = true;
      if (state.down && !press.wasDown) shake = 20;
      press.wasDown = state.down;
      const horizontalHit = Math.abs(player.x - press.x) < 132;
      const verticalHit = state.bottom > player.y - player.h * .85 && state.bottom < player.y + 35;
      if (horizontalHit && verticalHit) crushed = true;
    });
    updateSiren(warningAudible);
    if (crushed) {
      deaths++; updateSiren(false); reset(false); flash('ATINGIDO PELA PRENSA — RETORNANDO AO CHECKPOINT', 1100); return;
    }
    if (!won && player.x > WORLD_W - 205 && player.grounded) {
      won = true; player.vx = 0; flash('FASE 1 CONCLUÍDA — PORTÃO ALCANÇADO!', 2600);
      ui.status.textContent = `FASE 1 CONCLUÍDA · QUEDAS ${deaths}`;
    }

    const desiredCamera = Math.max(0, Math.min(WORLD_W - W, player.x - W * .34));
    cameraX += (desiredCamera - cameraX) * Math.min(1, dt * 4.8);
    if (!player.grounded) player.frame = player.vy < -120 ? 5 : player.vy > 240 ? 6 : 4;
    else if (Math.abs(player.vx) > 40) { player.runClock += dt * (7 + Math.abs(player.vx) / 105); player.frame = 1 + (Math.floor(player.runClock) % 3); }
    else player.frame = 0;
    updateHud();
  }
  function drawHero() {
    const cols = 4, rows = 2, sw = heroSheet.width / cols, sh = heroSheet.height / rows;
    const f = Math.max(0, Math.min(7, player.frame)), sx = (f % cols) * sw, sy = Math.floor(f / cols) * sh;
    const dh = player.h, dw = sw / sh * dh;
    ctx.save(); ctx.translate(player.x - cameraX, player.y);
    if (player.facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(heroSheet, sx, sy, sw, sh, -dw / 2, -dh, dw, dh); ctx.restore();
  }
  function drawAtmosphere() {
    ctx.save();
    smoke.forEach(s => {
      const x = s.x - cameraX, pulse = Math.sin(performance.now() * .00045 + s.phase) * 10;
      if (x < -150 || x > W + 150) return;
      const g = ctx.createRadialGradient(x, s.y + pulse, 5, x, s.y + pulse, s.size);
      g.addColorStop(0, 'rgba(80,75,70,.18)'); g.addColorStop(1, 'rgba(25,28,31,0)');
      ctx.fillStyle = g; ctx.fillRect(x - s.size, s.y - s.size + pulse, s.size * 2, s.size * 2);
    });
    ctx.globalCompositeOperation = 'lighter';
    sparks.forEach(s => {
      const x = s.x - cameraX; if (x < 0 || x > W) return;
      ctx.globalAlpha = Math.sin(s.life * Math.PI) * .8; ctx.fillStyle = '#ff9b31';
      ctx.fillRect(x, s.y, s.size, s.size * 3);
    });
    ctx.restore();
  }
  function drawPresses() {
    if (!pressSprite.complete) return;
    presses.forEach(press => {
      const state = pressState(press), x = press.x - cameraX;
      if (x < -180 || x > W + 180) return;
      if (state.warning) {
        const pulse = .34 + Math.sin(pressClock * 10) * .16;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255,70,0,${pulse})`; ctx.fillRect(x - 126, 533, 252, 15);
        ctx.beginPath(); ctx.arc(x, 118, 19 + pulse * 13, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,80,0,${pulse * .7})`; ctx.fill(); ctx.restore();
      }
      // Upper housing stays bolted to the ceiling; only the piston and crushing foot move.
      ctx.drawImage(pressSprite, 0, 0, 965, 620, x - 127, -18, 254, 163);
      const rodTop = 126, rodBottom = state.footY + 24;
      if (rodBottom > rodTop) {
        const chrome = ctx.createLinearGradient(x - 42, 0, x + 42, 0);
        chrome.addColorStop(0, '#272b2e'); chrome.addColorStop(.24, '#d8e0e2');
        chrome.addColorStop(.52, '#586064'); chrome.addColorStop(.78, '#f1f3ef'); chrome.addColorStop(1, '#24272a');
        ctx.fillStyle = chrome; ctx.fillRect(x - 42, rodTop, 84, rodBottom - rodTop);
        ctx.fillStyle = 'rgba(255,125,28,.35)'; ctx.fillRect(x + 34, rodTop, 5, rodBottom - rodTop);
      }
      ctx.drawImage(pressSprite, 0, 1080, 965, 550, x - 127, state.footY, 254, 150);
    });
  }
  function draw() {
    ctx.fillStyle = '#050607'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (shake) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake * .55);
    backgrounds.forEach((image, i) => {
      const x = i * W - cameraX;
      if (image.complete && x < W && x > -W) ctx.drawImage(image, x, 0, W, H);
    });
    drawAtmosphere();
    if (heroSheet.complete) drawHero();
    drawPresses();
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 1050);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function loop(t) {
    const dt = Math.min(.034, (t - last) / 1000 || 0); last = t;
    fpsClock += dt; fpsFrames++;
    if (fpsClock >= .55) { ui.fps.textContent = `${Math.round(fpsFrames / fpsClock)} FPS`; fpsClock = 0; fpsFrames = 0; }
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
    initSiren(); if (audioContext?.state === 'suspended') audioContext.resume();
    ui.intro.classList.add('hidden'); ui.hud.classList.remove('hidden'); ui.controls.classList.remove('hidden');
    reset(); playing = true; flash('ATRAVESSE OS SETE SETORES', 1350);
  });
  document.querySelector('#pause').addEventListener('click', () => { paused = !paused; if (paused) updateSiren(false); flash(paused ? 'PAUSADO' : 'CONTINUAR', 700); });
  addEventListener('keydown', e => { if (e.key === 'ArrowLeft') keys.left = true; if (e.key === 'ArrowRight') keys.right = true; if (['ArrowUp',' '].includes(e.key)) keys.jump = true; });
  addEventListener('keyup', e => { if (e.key === 'ArrowLeft') keys.left = false; if (e.key === 'ArrowRight') keys.right = false; if (['ArrowUp',' '].includes(e.key)) keys.jump = false; });
  window.ForjaGame = { back() { if (playing) { paused = true; flash('PAUSADO'); return true; } return false; } };
  requestAnimationFrame(loop);
})();
