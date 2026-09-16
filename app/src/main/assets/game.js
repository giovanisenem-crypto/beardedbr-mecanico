(() => {
  'use strict';
  const W = 1672, H = 941, WORLD_W = W * 7;
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  ctx.imageSmoothingEnabled = true;

  const ui = {
    loading: document.querySelector('#loading'), intro: document.querySelector('#intro'),
    hud: document.querySelector('#hud'), controls: document.querySelector('#controls'),
    status: document.querySelector('#status'), scrap: document.querySelector('#scrap'), score: document.querySelector('#score'), power: document.querySelector('#power'), fps: document.querySelector('#fps'),
    sound: document.querySelector('#sound'), message: document.querySelector('#message'),
    messageText: document.querySelector('#message div'), result: document.querySelector('#result'),
    resultStats: document.querySelector('#result-stats')
  };
  const backgroundSources = [
    'art/forge_stage.webp', 'art/forge_stage_02.webp', 'art/forge_stage_03.webp',
    'art/forge_stage_04.webp', 'art/forge_stage_05.webp', 'art/forge_stage_06.webp',
    'art/forge_stage_07.webp'
  ];
  const backgrounds = backgroundSources.map(() => new Image());
  const heroSheet = new Image();
  const pressSprite = new Image();
  const sentinelSprite = new Image();
  const launcherSprite = new Image();
  const crateSprite = new Image();
  let loaded = 0;
  const ready = () => {
    if (++loaded === backgrounds.length + 5) setTimeout(() => {
      ui.loading.classList.add('hidden'); ui.intro.classList.remove('hidden'); draw();
    }, 650);
  };
  backgrounds.forEach((image, i) => { image.onload = ready; image.src = backgroundSources[i]; });
  heroSheet.onload = ready; heroSheet.src = 'art/mechanic_sheet.webp';
  pressSprite.onload = ready; pressSprite.src = 'art/hydraulic_press.webp';
  sentinelSprite.onload = ready; sentinelSprite.src = 'art/sentinel.webp';
  launcherSprite.onload = ready; launcherSprite.src = 'art/rivet_launcher.webp';
  crateSprite.onload = ready; crateSprite.src = 'art/supply_crate.webp';

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
  const enemies = [
    { x: W + 785, min: W + 660, max: W + 950, y: 548, dir: 1, alive: true },
    { x: W * 2 + 840, min: W * 2 + 690, max: W * 2 + 1065, y: 548, dir: -1, alive: true },
    { x: W * 3 + 1390, min: W * 3 + 1240, max: W * 4 - 75, y: 548, dir: 1, alive: true },
    { x: W * 4 + 1070, min: W * 4 + 970, max: W * 4 + 1170, y: 548, dir: -1, alive: true },
    { x: W * 6 + 760, min: W * 6 + 625, max: W * 6 + 905, y: 548, dir: 1, alive: true }
  ];
  enemies.forEach(enemy => { enemy.startX = enemy.x; enemy.startDir = enemy.dir; enemy.hp = 2; enemy.hitFlash = 0; });
  const crates = [
    { x: 1240, y: 548, kind: 'points', reward: 300 }, { x: W + 1320, y: 548, kind: 'magnet' },
    { x: W * 2 + 1450, y: 548, kind: 'points', reward: 400 }, { x: W * 3 + 280, y: 548, kind: 'spread' },
    { x: W * 4 + 1500, y: 548, kind: 'magnet' }, { x: W * 5 + 1370, y: 548, kind: 'spread' },
    { x: W * 6 + 1320, y: 548, kind: 'points', reward: 600 }
  ].map(crate => ({ ...crate, w: 125, h: 120, hp: 2, alive: true, hitFlash: 0 }));
  const collectibles = [
    { x: 240, y: 468 }, { x: 835, y: 468 }, { x: 1375, y: 468 },
    { x: W + 630, y: 201 }, { x: W + 1160, y: 201 }, { x: W + 1400, y: 468 },
    { x: W * 2 + 830, y: 468 }, { x: W * 2 + 1430, y: 468 },
    { x: W * 3 + 700, y: 337 }, { x: W * 3 + 900, y: 190 }, { x: W * 3 + 1080, y: 338 }, { x: W * 3 + 1400, y: 468 },
    { x: W * 4 + 700, y: 255 }, { x: W * 4 + 1200, y: 214 }, { x: W * 4 + 1480, y: 468 },
    { x: W * 5 + 1320, y: 243 },
    { x: W * 6 + 730, y: 468 }, { x: W * 6 + 960, y: 243 }, { x: W * 6 + 1210, y: 468 }
  ].map(item => ({ ...item, startX: item.x, startY: item.y, picked: false }));
  const player = { x: spawn.x, y: spawn.y, vx: 0, vy: 0, w: 88, h: 210, grounded: true, facing: 1, frame: 0, runClock: 0 };
  const keys = { left: false, right: false, jump: false, attack: false };
  const sparks = Array.from({ length: 54 }, (_, i) => ({
    x: (i * 431) % WORLD_W, y: 260 + (i * 83) % 310, vx: 15 + (i % 5) * 9,
    vy: -42 - (i % 7) * 8, life: (i % 13) / 13, size: 2 + (i % 3)
  }));
  const smoke = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 617 + 300) % WORLD_W, y: 510 - (i % 4) * 48, phase: i * .7, size: 65 + (i % 4) * 24
  }));
  const bursts = [], projectiles = [], powerups = [];
  let playing = false, paused = false, last = 0, deaths = 0, defeats = 0, collected = 0, points = 0, won = false, cameraX = 0, checkpointIndex = -1;
  let pressClock = 0, shake = 0, audioContext = null, sirenOscillator = null, sirenGain = null;
  let musicGain = null, musicTimer = null, musicStep = 0, soundEnabled = true;
  let fpsClock = 0, fpsFrames = 0, shootCooldown = 0, shootPose = 0, muzzleFlash = 0, magnetTimer = 0, spreadTimer = 0;

  function pressState(press) {
    const t = (pressClock + press.phase) % 6.6;
    const restY = 135, impactY = 398;
    let footY = restY;
    if (t >= 5 && t < 5.3) {
      const k = (t - 5) / .3; footY = restY + (impactY - restY) * k * k * k;
    } else if (t >= 5.3 && t < 5.6) footY = impactY;
    else if (t >= 5.6) {
      const k = Math.min(1, (t - 5.6) / 1); footY = impactY - (impactY - restY) * k;
    }
    return { footY, bottom: footY + 150, warning: t >= 3.6 && t < 5, down: t >= 5.3 && t < 5.6 };
  }
  function initSiren() {
    if (audioContext) return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      sirenOscillator = audioContext.createOscillator(); sirenGain = audioContext.createGain();
      sirenOscillator.type = 'sine'; sirenGain.gain.value = 0;
      sirenOscillator.connect(sirenGain).connect(audioContext.destination); sirenOscillator.start();
      musicGain = audioContext.createGain(); musicGain.gain.value = .34;
      musicGain.connect(audioContext.destination);
      musicTimer = setInterval(playMusicStep, 268);
    } catch (_) { audioContext = null; }
  }
  function tone(frequency, duration, type, volume) {
    if (!audioContext || !musicGain || !soundEnabled || paused || !playing) return;
    const now = audioContext.currentTime, oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(volume, now + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(musicGain); oscillator.start(now); oscillator.stop(now + duration + .03);
  }
  function playMusicStep() {
    const bass = [55, 55, 65.41, 73.42, 55, 82.41, 73.42, 65.41, 49, 49, 55, 65.41, 49, 73.42, 65.41, 55];
    const step = musicStep++ % bass.length;
    tone(bass[step], .22, 'sawtooth', .032);
    if (step % 4 === 0) tone(42, .16, 'sine', .065);
    if (step % 4 === 2) tone(bass[step] * 4, .09, 'triangle', .012);
    if (step === 7 || step === 15) tone(bass[step] * 3, .42, 'triangle', .016);
  }
  function setAudioLevel() {
    if (!audioContext || !musicGain) return;
    musicGain.gain.setTargetAtTime(soundEnabled && !paused ? .34 : 0, audioContext.currentTime, .08);
  }
  function updateSiren(warning) {
    if (!audioContext || !sirenGain || !sirenOscillator) return;
    const now = audioContext.currentTime;
    sirenGain.gain.setTargetAtTime(warning && !paused && soundEnabled ? .012 : 0, now, .11);
    if (warning) sirenOscillator.frequency.setValueAtTime(430 + Math.sin(pressClock * 5) * 70, now);
  }

  function sector() { return Math.min(7, Math.floor(player.x / W) + 1); }
  function updateHud() {
    const names = ['PISO DE FUNDIÇÃO', 'PASSARELAS', 'LAMINAÇÃO', 'TORRE VERTICAL', 'LINHA DE FUNDIÇÃO', 'SALÃO DE PRENSAS', 'PORTÃO DA FORJA'];
    ui.status.textContent = `SETOR 0${sector()} · ${names[sector() - 1]} · QUEDAS ${deaths}`;
    ui.scrap.textContent = `SUCATA ${defeats}/${enemies.length}`;
    ui.score.textContent = `PONTOS ${String(points).padStart(4, '0')}`;
    const active = [];
    if (magnetTimer > 0) active.push(`ÍMÃ ${Math.ceil(magnetTimer)}s`);
    if (spreadTimer > 0) active.push(`TRIPLO ${Math.ceil(spreadTimer)}s`);
    ui.power.textContent = active.join(' · '); ui.power.classList.toggle('hidden', active.length === 0);
  }
  function reset(showText = false) {
    const safe = checkpointIndex >= 0 ? checkpoints[checkpointIndex] : spawn;
    player.x = safe.x; player.y = safe.y; player.vx = 0; player.vy = 0;
    player.grounded = true; player.frame = 0; projectiles.length = 0; shootPose = 0; muzzleFlash = 0;
    cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * .28));
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
    const crateTop = crates.find(crate => crate.alive && right > crate.x - crate.w / 2 && left < crate.x + crate.w / 2 && prevFoot <= crate.y - crate.h + 5 && nextFoot >= crate.y - crate.h);
    if (crateTop) return { x1: crateTop.x - crateTop.w / 2, x2: crateTop.x + crateTop.w / 2, y: crateTop.y - crateTop.h };
    return platforms.find(p => right > p.x1 && left < p.x2 && prevFoot <= p.y + 5 && nextFoot >= p.y);
  }
  function updateParticles(dt) {
    sparks.forEach(s => {
      s.life += dt * .48; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.life > 1 || s.y < 120) { s.life = 0; s.y = 570; s.x = (s.x + 739) % WORLD_W; }
    });
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 980 * dt;
      if (b.life <= 0) bursts.splice(i, 1);
    }
  }
  function burstAt(x, y) {
    for (let i = 0; i < 18; i++) bursts.push({
      x, y, vx: (Math.random() - .5) * 520, vy: -160 - Math.random() * 420,
      life: .35 + Math.random() * .4, size: 3 + Math.random() * 5
    });
  }
  function destroyEnemy(enemy, message = 'SENTINELA DESTRUÍDO') {
    if (!enemy.alive) return;
    enemy.alive = false; defeats++; points += 250; burstAt(enemy.x, enemy.y - 72); shake = 8;
    tone(105, .22, 'sawtooth', .05); flash(message, 700); updateHud();
  }
  function fireRivet() {
    const angles = spreadTimer > 0 ? [-115, 0, 115] : [0];
    angles.forEach(vy => projectiles.push({
      x: player.x + player.facing * 74, y: player.y - 126,
      vx: player.facing * 780, vy, life: 1.65, dir: player.facing
    }));
    shootPose = .24; muzzleFlash = .075;
    player.vx -= player.facing * 22;
    tone(190, .09, 'square', .032); tone(760, .045, 'triangle', .014);
  }
  function updateProjectiles(dt) {
    enemies.forEach(enemy => { enemy.hitFlash = Math.max(0, enemy.hitFlash - dt); });
    crates.forEach(crate => { crate.hitFlash = Math.max(0, crate.hitFlash - dt); });
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const shot = projectiles[i]; shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
      let hit = false;
      for (const crate of crates) {
        if (!crate.alive) continue;
        if (Math.abs(shot.x - crate.x) < crate.w / 2 + 12 && shot.y > crate.y - crate.h - 14 && shot.y < crate.y) {
          hit = true; crate.hp--; crate.hitFlash = .16; burstAt(shot.x, shot.y); tone(260, .07, 'square', .028);
          if (crate.hp <= 0) {
            crate.alive = false; points += 100; burstAt(crate.x, crate.y - crate.h / 2);
            powerups.push({ x: crate.x, y: crate.y - crate.h - 38, type: crate.kind, reward: crate.reward || 0, phase: Math.random() * 6 });
            tone(92, .25, 'sawtooth', .055); flash('CAIXA ABERTA · BÔNUS LIBERADO', 850); updateHud();
          }
          break;
        }
      }
      if (hit) { projectiles.splice(i, 1); continue; }
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (Math.abs(shot.x - enemy.x) < 70 && shot.y > enemy.y - 132 && shot.y < enemy.y - 8) {
          hit = true; enemy.hp--; enemy.hitFlash = .16; burstAt(shot.x, shot.y);
          tone(320, .07, 'square', .025);
          if (enemy.hp <= 0) destroyEnemy(enemy, 'SENTINELA DESMONTADO PELOS REBITES');
          break;
        }
      }
      if (hit || shot.life <= 0 || shot.x < 0 || shot.x > WORLD_W) projectiles.splice(i, 1);
    }
  }
  function update(dt) {
    updateParticles(dt);
    if (!playing || paused || won) return;
    pressClock += dt;
    shootPose = Math.max(0, shootPose - dt); muzzleFlash = Math.max(0, muzzleFlash - dt);
    magnetTimer = Math.max(0, magnetTimer - dt); spreadTimer = Math.max(0, spreadTimer - dt);
    shootCooldown = Math.max(0, shootCooldown - dt);
    if (keys.attack && shootCooldown <= 0) { fireRivet(); shootCooldown = .48; }
    updateProjectiles(dt);
    shake *= Math.pow(.012, dt);
    if (shake < .2) shake = 0;
    const accel = player.grounded ? 2750 : 1750;
    const target = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (target) { player.vx += target * accel * dt; player.facing = target; }
    else player.vx *= Math.pow(player.grounded ? .0006 : .07, dt);
    player.vx = Math.max(-455, Math.min(455, player.vx));
    if (keys.jump && player.grounded) { player.vy = -1120; player.grounded = false; keys.jump = false; }

    const prevFoot = player.y, prevX = player.x;
    player.x += player.vx * dt; player.vy += 2100 * dt; player.y += player.vy * dt;
    player.x = Math.max(42, Math.min(WORLD_W - 42, player.x));
    const floor = platformBelow(prevFoot, player.y);
    if (floor) { player.y = floor.y; player.vy = 0; player.grounded = true; }
    else if (player.grounded) {
      const supported = platforms.some(p => player.x + player.w * .27 > p.x1 && player.x - player.w * .27 < p.x2 && Math.abs(player.y - p.y) < 8);
      if (!supported) player.grounded = false;
    }
    const blockingCrate = crates.find(crate => crate.alive && player.y > crate.y - crate.h + 12 && player.y - player.h * .78 < crate.y && player.x + player.w * .28 > crate.x - crate.w / 2 && player.x - player.w * .28 < crate.x + crate.w / 2);
    if (blockingCrate) { player.x = prevX; player.vx = 0; }

    for (let i = powerups.length - 1; i >= 0; i--) {
      const bonus = powerups[i];
      if (Math.abs(player.x - bonus.x) < 68 && bonus.y > player.y - player.h * .9 - 20 && bonus.y < player.y + 25) {
        if (bonus.type === 'magnet') { magnetTimer = 12; flash('ÍMÃ COLETOR ATIVO · 12 SEGUNDOS', 1000); }
        else if (bonus.type === 'spread') { spreadTimer = 10; flash('DISPARO TRIPLO ATIVO · 10 SEGUNDOS', 1000); }
        else { points += bonus.reward; flash(`BÔNUS DE PONTOS · +${bonus.reward}`, 900); }
        points += 150; burstAt(bonus.x, bonus.y); tone(960, .18, 'triangle', .05); powerups.splice(i, 1); updateHud();
      }
    }

    if (magnetTimer > 0) collectibles.forEach(item => {
      if (item.picked) return;
      const dx = player.x - item.x, dy = player.y - player.h * .45 - item.y, distance = Math.hypot(dx, dy);
      if (distance < 360 && distance > 8) {
        const speed = Math.min(720, 260 + (360 - distance) * 1.6);
        item.x += dx / distance * speed * dt; item.y += dy / distance * speed * dt;
      }
    });

    collectibles.forEach(item => {
      if (item.picked) return;
      const insideX = Math.abs(player.x - item.x) < 58;
      const insideY = item.y > player.y - player.h * .9 - 20 && item.y < player.y + 22;
      if (insideX && insideY) {
        item.picked = true; collected++; points += 100; burstAt(item.x, item.y);
        tone(740 + (collected % 4) * 90, .13, 'triangle', .045); updateHud();
      }
    });

    let sentinelHit = false;
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      enemy.x += enemy.dir * 82 * dt;
      if (enemy.x <= enemy.min) { enemy.x = enemy.min; enemy.dir = 1; }
      if (enemy.x >= enemy.max) { enemy.x = enemy.max; enemy.dir = -1; }
      const eLeft = enemy.x - 62, eRight = enemy.x + 62, eTop = enemy.y - 126;
      const pLeft = player.x - player.w * .3, pRight = player.x + player.w * .3, pTop = player.y - player.h * .86;
      if (pRight > eLeft && pLeft < eRight && player.y > eTop + 10 && pTop < enemy.y - 8) {
        if (player.vy > 120 && prevFoot <= eTop + 28) {
          destroyEnemy(enemy); player.y = eTop; player.vy = -690; player.grounded = false;
        } else sentinelHit = true;
      }
    });
    if (sentinelHit) {
      deaths++; updateSiren(false); reset(false); flash('ATINGIDO PELO SENTINELA — RETORNANDO AO CHECKPOINT', 1100); return;
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
      // Only the central impact zone is lethal, and only while the foot is fully down.
      // Brushing the housing or crossing under the retracted piston is safe.
      const horizontalHit = Math.abs(player.x - press.x) < 106;
      const verticalHit = state.bottom > player.y - player.h * .85 && state.bottom < player.y + 35;
      if (state.down && horizontalHit && verticalHit) crushed = true;
    });
    updateSiren(warningAudible);
    if (crushed) {
      deaths++; updateSiren(false); reset(false); flash('ATINGIDO PELA PRENSA — RETORNANDO AO CHECKPOINT', 1100); return;
    }
    if (!won && player.x > WORLD_W - 205 && player.grounded) {
      won = true; player.vx = 0; points += Math.max(0, 1000 - deaths * 100); updateSiren(false); setAudioLevel();
      flash('FASE 1 CONCLUÍDA — PORTÃO ALCANÇADO!', 900);
      ui.status.textContent = `FASE 1 CONCLUÍDA · QUEDAS ${deaths}`;
      ui.scrap.textContent = `SUCATA ${defeats}/${enemies.length}`;
      ui.score.textContent = `PONTOS ${String(points).padStart(4, '0')}`;
      setTimeout(() => {
        ui.controls.classList.add('hidden');
        ui.resultStats.textContent = `PONTOS  ${points}\nENGRENAGENS  ${collected}/${collectibles.length}\nSUCATA  ${defeats}/${enemies.length}\nCAIXAS  ${crates.filter(crate => !crate.alive).length}/${crates.length}\nQUEDAS  ${deaths}`;
        ui.result.classList.remove('hidden');
      }, 900);
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
  function drawWeapon() {
    if (!launcherSprite.complete || (!keys.attack && shootPose <= 0)) return;
    const kick = muzzleFlash > 0 ? -5 * (muzzleFlash / .075) : 0;
    ctx.save(); ctx.translate(player.x - cameraX, player.y); if (player.facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(launcherSprite, -38 + kick, -157, 112, 62);
    if (muzzleFlash > 0) {
      const strength = muzzleFlash / .075; ctx.globalCompositeOperation = 'lighter';
      const flare = ctx.createRadialGradient(75 + kick, -126, 2, 75 + kick, -126, 25);
      flare.addColorStop(0, `rgba(255,255,230,${strength})`); flare.addColorStop(.28, `rgba(105,220,255,${strength})`); flare.addColorStop(1, 'rgba(20,120,255,0)');
      ctx.fillStyle = flare; ctx.fillRect(49 + kick, -152, 52, 52);
    }
    ctx.restore();
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
    bursts.forEach(b => {
      const x = b.x - cameraX; ctx.globalAlpha = Math.min(1, b.life / .22);
      ctx.fillStyle = '#ffb238'; ctx.fillRect(x, b.y, b.size, b.size * 2.4);
    });
    ctx.restore();
  }
  function drawObjectives() {
    const now = performance.now();
    checkpoints.forEach((checkpoint, i) => {
      const x = checkpoint.x - cameraX; if (x < -100 || x > W + 100) return;
      const active = i <= checkpointIndex, pulse = .55 + Math.sin(now * .006 + i) * .18;
      ctx.save();
      ctx.fillStyle = '#171b1d'; ctx.fillRect(x - 9, checkpoint.y - 112, 18, 112);
      ctx.strokeStyle = active ? '#7dff9a' : '#ff8a2d'; ctx.lineWidth = 4; ctx.strokeRect(x - 16, checkpoint.y - 126, 32, 28);
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = active ? `rgba(70,255,130,${pulse})` : `rgba(255,112,25,${pulse})`;
      ctx.beginPath(); ctx.arc(x, checkpoint.y - 112, 13, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#f4e7d2'; ctx.font = '900 16px Arial'; ctx.textAlign = 'center'; ctx.fillText(`CP${i + 1}`, x, checkpoint.y - 136);
    });
    collectibles.forEach((item, i) => {
      if (item.picked) return;
      const x = item.x - cameraX; if (x < -70 || x > W + 70) return;
      const bob = Math.sin(now * .004 + i) * 7;
      ctx.save(); ctx.translate(x, item.y + bob); ctx.rotate(now * .0022 + i);
      ctx.shadowColor = '#ff8a19'; ctx.shadowBlur = 24;
      const metal = ctx.createRadialGradient(-8, -10, 3, 0, 0, 31);
      metal.addColorStop(0, '#fff1b0'); metal.addColorStop(.22, '#ffb52f'); metal.addColorStop(.58, '#9a4b06'); metal.addColorStop(1, '#2c1a10');
      ctx.fillStyle = metal; ctx.beginPath();
      for (let n = 0; n < 24; n++) {
        const radius = n % 3 === 0 ? 31 : 24, angle = n / 24 * Math.PI * 2;
        const px = Math.cos(angle) * radius, py = Math.sin(angle) * radius;
        if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#16191b'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffe39b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
    powerups.forEach((bonus, i) => {
      const x = bonus.x - cameraX; if (x < -70 || x > W + 70) return;
      const y = bonus.y + Math.sin(now * .005 + bonus.phase) * 8;
      const color = bonus.type === 'magnet' ? '#5ce4ff' : bonus.type === 'spread' ? '#ff9d35' : '#ffe06a';
      ctx.save(); ctx.translate(x, y); ctx.rotate(now * .0015 + i);
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 38);
      glow.addColorStop(0, '#ffffff'); glow.addColorStop(.22, color); glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#20262a'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke(); ctx.rotate(-(now * .0015 + i));
      ctx.fillStyle = '#fff'; ctx.font = '950 18px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(bonus.type === 'magnet' ? 'M' : bonus.type === 'spread' ? '×3' : '+', 0, 1); ctx.restore();
    });
  }
  function drawCrates() {
    if (!crateSprite.complete) return;
    crates.forEach(crate => {
      if (!crate.alive) return;
      const x = crate.x - cameraX; if (x < -100 || x > W + 100) return;
      ctx.save();
      ctx.drawImage(crateSprite, x - crate.w / 2, crate.y - crate.h, crate.w, crate.h);
      if (crate.hitFlash > 0) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, crate.hitFlash * 5);
        ctx.drawImage(crateSprite, x - crate.w / 2, crate.y - crate.h, crate.w, crate.h);
      }
      ctx.restore();
    });
  }
  function drawEnemies() {
    if (!sentinelSprite.complete) return;
    enemies.forEach((enemy, i) => {
      if (!enemy.alive) return;
      const x = enemy.x - cameraX; if (x < -160 || x > W + 160) return;
      const bob = Math.sin(performance.now() * .004 + i) * 2;
      ctx.save(); ctx.translate(x, enemy.y + bob);
      if (enemy.dir < 0) ctx.scale(-1, 1);
      ctx.drawImage(sentinelSprite, -72, -138, 144, 138);
      if (enemy.hitFlash > 0) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, enemy.hitFlash * 5);
        ctx.drawImage(sentinelSprite, -72, -138, 144, 138);
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,102,18,${.12 + Math.sin(performance.now() * .008 + i) * .04})`;
      ctx.beginPath(); ctx.arc(42, -85, 25, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
  }
  function drawProjectiles() {
    projectiles.forEach(shot => {
      const x = shot.x - cameraX; if (x < -50 || x > W + 50) return;
      ctx.save(); ctx.translate(x, shot.y); if (shot.dir < 0) ctx.scale(-1, 1);
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
      glow.addColorStop(0, 'rgba(220,248,255,1)'); glow.addColorStop(.35, 'rgba(77,194,255,.75)'); glow.addColorStop(1, 'rgba(34,120,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(-25, -25, 50, 50);
      const steel = ctx.createLinearGradient(-18, -6, 18, 6);
      steel.addColorStop(0, '#2d3337'); steel.addColorStop(.35, '#eaf5f6'); steel.addColorStop(.65, '#718084'); steel.addColorStop(1, '#22282b');
      ctx.fillStyle = steel; ctx.beginPath(); ctx.roundRect(-20, -6, 40, 12, 6); ctx.fill();
      ctx.fillStyle = '#8fe5ff'; ctx.fillRect(12, -3, 13, 6); ctx.restore();
    });
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
    drawCrates();
    drawObjectives();
    drawProjectiles();
    drawEnemies();
    if (heroSheet.complete) { drawHero(); drawWeapon(); }
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
  function startNewRun() {
    deaths = 0; defeats = 0; collected = 0; points = 0; checkpointIndex = -1; pressClock = 0;
    enemies.forEach(enemy => { enemy.x = enemy.startX; enemy.dir = enemy.startDir; enemy.alive = true; enemy.hp = 2; enemy.hitFlash = 0; });
    crates.forEach(crate => { crate.alive = true; crate.hp = 2; crate.hitFlash = 0; });
    collectibles.forEach(item => { item.x = item.startX; item.y = item.startY; item.picked = false; });
    presses.forEach(press => { press.wasDown = false; });
    projectiles.length = 0; powerups.length = 0; shootCooldown = 0; shootPose = 0; muzzleFlash = 0;
    magnetTimer = 0; spreadTimer = 0; keys.attack = false; ui.power.classList.add('hidden');
    ui.result.classList.add('hidden'); ui.controls.classList.remove('hidden');
    paused = false; playing = true; reset(); setAudioLevel();
    flash('COLETE AS ENGRENAGENS E ALCANCE O PORTÃO', 1500);
  }
  bindHold('#left','left'); bindHold('#right','right'); bindHold('#jump','jump'); bindHold('#attack','attack');
  document.querySelector('#start').addEventListener('click', () => {
    initSiren(); if (audioContext?.state === 'suspended') audioContext.resume();
    ui.intro.classList.add('hidden'); ui.hud.classList.remove('hidden'); ui.controls.classList.remove('hidden');
    startNewRun();
  });
  document.querySelector('#replay').addEventListener('click', startNewRun);
  document.querySelector('#sound').addEventListener('click', () => {
    soundEnabled = !soundEnabled; ui.sound.textContent = soundEnabled ? '♪' : '×';
    setAudioLevel(); if (!soundEnabled) updateSiren(false);
    flash(soundEnabled ? 'SOM LIGADO' : 'SOM DESLIGADO', 650);
  });
  document.querySelector('#pause').addEventListener('click', () => {
    paused = !paused; if (paused) updateSiren(false); setAudioLevel(); flash(paused ? 'PAUSADO' : 'CONTINUAR', 700);
  });
  addEventListener('keydown', e => { if (e.key === 'ArrowLeft') keys.left = true; if (e.key === 'ArrowRight') keys.right = true; if (['ArrowUp',' '].includes(e.key)) keys.jump = true; if (['z','x','Enter'].includes(e.key)) keys.attack = true; });
  addEventListener('keyup', e => { if (e.key === 'ArrowLeft') keys.left = false; if (e.key === 'ArrowRight') keys.right = false; if (['ArrowUp',' '].includes(e.key)) keys.jump = false; if (['z','x','Enter'].includes(e.key)) keys.attack = false; });
  window.ForjaGame = { back() { if (playing) { paused = true; flash('PAUSADO'); return true; } return false; } };
  requestAnimationFrame(loop);
})();
