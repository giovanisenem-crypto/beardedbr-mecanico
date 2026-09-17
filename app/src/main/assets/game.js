(() => {
  'use strict';
  const W = 1672, H = 941, WORLD_W = W * 7;
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  ctx.imageSmoothingEnabled = true;

  const ui = {
    loading: document.querySelector('#loading'), map: document.querySelector('#stage-map'), preview: document.querySelector('#phase-two-preview'), phaseTwoComplete: document.querySelector('#phase-two-complete'), intro: document.querySelector('#intro'),
    hud: document.querySelector('#hud'), controls: document.querySelector('#controls'),
    status: document.querySelector('#status'), scrap: document.querySelector('#scrap'), score: document.querySelector('#score'), power: document.querySelector('#power'), fps: document.querySelector('#fps'),
    sound: document.querySelector('#sound'), message: document.querySelector('#message'),
    messageText: document.querySelector('#message div'), result: document.querySelector('#result'),
    resultStats: document.querySelector('#result-stats'), resultStars: document.querySelector('#result-stars'),
    resultObjectives: document.querySelector('#result-objectives'), resultRecord: document.querySelector('#result-record'),
    introRecord: document.querySelector('#intro-record'), mapStars: document.querySelector('#map-stars'), mapRecord: document.querySelector('#map-record'),
    phaseTwo: document.querySelector('#phase-two'), phaseTwoStatus: document.querySelector('#phase-two-status'), phaseTwoStats: document.querySelector('#phase-two-stats'), mapTip: document.querySelector('#map-tip'),
    bossHud: document.querySelector('#boss-hud'), bossHealth: document.querySelector('#boss-health')
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
  const bossSprite = new Image();
  const phaseTwoBackground = new Image();
  const steamVentSprite = new Image();
  let loaded = 0;
  const ready = () => {
    if (++loaded === backgrounds.length + 8) setTimeout(() => {
      ui.loading.classList.add('hidden'); ui.map.classList.remove('hidden'); updateMap(); draw();
    }, 650);
  };
  backgrounds.forEach((image, i) => { image.onload = ready; image.src = backgroundSources[i]; });
  heroSheet.onload = ready; heroSheet.src = 'art/mechanic_sheet.webp';
  pressSprite.onload = ready; pressSprite.src = 'art/hydraulic_press.webp';
  sentinelSprite.onload = ready; sentinelSprite.src = 'art/sentinel.webp';
  launcherSprite.onload = ready; launcherSprite.src = 'art/rivet_launcher.webp';
  crateSprite.onload = ready; crateSprite.src = 'art/supply_crate.webp';
  bossSprite.onload = ready; bossSprite.src = 'art/forge_guardian.webp';
  phaseTwoBackground.onload = ready; phaseTwoBackground.src = 'art/blast_furnace_preview.webp';
  steamVentSprite.onload = ready; steamVentSprite.src = 'art/steam_vent.webp';

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
  const checkpoints = [{ x: W * 2 + 918, y: 548 }, { x: W * 4 + 1118, y: 548 }, { x: W * 6 + 1148, y: 548 }];
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
    { x: W * 6 + 330, y: 548, kind: 'points', reward: 600 }
  ].map(crate => ({ ...crate, w: 125, h: 120, hp: 2, alive: true, hitFlash: 0 }));
  const boss = { x: W * 6 + 1430, y: 548, min: W * 6 + 1330, max: WORLD_W - 165, dir: -1, hp: 10, maxHp: 10, alive: true, active: false, introduced: false, hitFlash: 0, shotClock: 1.25, deathClock: 0, explosionClock: 0 };
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
  const phaseTwoPlatforms = [{ x1: 0, x2: 420, y: 568 }, { x1: 565, x2: 1175, y: 568 }, { x1: 1305, x2: W, y: 568 }];
  const phaseTwoGears = [{ x: 245, y: 480 }, { x: 690, y: 480 }, { x: 910, y: 420 }, { x: 1115, y: 480 }, { x: 1450, y: 480 }].map(item => ({ ...item, picked: false }));
  const phaseTwoEnemy = { x: 820, startX: 820, min: 680, max: 1080, y: 568, dir: 1, hp: 2, alive: true, hitFlash: 0 };
  const phaseTwoState = { playing: false, won: false, deaths: 0, collected: 0, defeats: 0, points: 0, clock: 0, steamSpawn: 0 };
  const keys = { left: false, right: false, jump: false, attack: false };
  const sparks = Array.from({ length: 54 }, (_, i) => ({
    x: (i * 431) % WORLD_W, y: 260 + (i * 83) % 310, vx: 15 + (i % 5) * 9,
    vy: -42 - (i % 7) * 8, life: (i % 13) / 13, size: 2 + (i % 3)
  }));
  const smoke = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 617 + 300) % WORLD_W, y: 510 - (i % 4) * 48, phase: i * .7, size: 65 + (i % 4) * 24
  }));
  const bursts = [], projectiles = [], powerups = [], bossShots = [], steamParticles = [];
  let playing = false, paused = false, last = 0, deaths = 0, defeats = 0, collected = 0, points = 0, won = false, cameraX = 0, checkpointIndex = -1;
  let pressClock = 0, shake = 0, audioContext = null, sirenOscillator = null, sirenGain = null;
  let musicGain = null, musicTimer = null, musicStep = 0, soundEnabled = true;
  let fpsClock = 0, fpsFrames = 0, shootCooldown = 0, shootPose = 0, muzzleFlash = 0, magnetTimer = 0, spreadTimer = 0;
  let gateProgress = 0, celebrating = false, victoryClock = 0, victoryToneStep = 0;
  const SAVE_KEY = 'forja_de_aco_progress_v1';

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { bestScore: 0, bestStars: 0, wins: 0, bestDeaths: null }; }
    catch (_) { return { bestScore: 0, bestStars: 0, wins: 0, bestDeaths: null }; }
  }
  function updateIntroRecord() {
    const progress = loadProgress();
    ui.introRecord.textContent = progress.wins > 0 ? `RECORDE ${progress.bestScore} PTS · ${'★'.repeat(progress.bestStars)}${'☆'.repeat(3 - progress.bestStars)} · VITÓRIAS ${progress.wins}` : 'PRIMEIRA TENTATIVA';
  }
  function updateMap() {
    const progress = loadProgress();
    const phaseTwoUnlocked = true;
    ui.mapStars.textContent = `${'★'.repeat(progress.bestStars)}${'☆'.repeat(3 - progress.bestStars)}`;
    ui.mapRecord.textContent = progress.wins > 0 ? `RECORDE ${progress.bestScore} · VITÓRIAS ${progress.wins}` : 'SEM RECORDE · TOQUE PARA JOGAR';
    ui.phaseTwo.disabled = !phaseTwoUnlocked;
    ui.phaseTwo.classList.toggle('locked', !phaseTwoUnlocked); ui.phaseTwo.classList.toggle('unlocked', phaseTwoUnlocked);
    ui.phaseTwo.setAttribute('aria-label', phaseTwoUnlocked ? 'Abrir prévia da Fase 2' : 'Fase 2 bloqueada');
    ui.phaseTwoStatus.textContent = progress.phaseTwoPreviewCompleted ? 'TRECHO CONCLUÍDO · JOGAR NOVAMENTE' : 'TRECHO JOGÁVEL · TOQUE PARA ENTRAR';
    ui.mapTip.textContent = progress.phaseTwoPreviewCompleted ? 'PRIMEIRO TRECHO DO ALTO-FORNO CONCLUÍDO' : 'O PRIMEIRO TRECHO DO ALTO-FORNO ESTÁ PRONTO PARA TESTE';
    const phaseTwoMark = ui.phaseTwo.querySelector('.lock-mark'); phaseTwoMark.textContent = phaseTwoUnlocked ? '▶' : '◆'; phaseTwoMark.classList.toggle('ready', phaseTwoUnlocked);
  }

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
    ui.bossHud.classList.toggle('hidden', !boss.active || !boss.alive || won);
    ui.bossHealth.style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
  }
  function reset(showText = false) {
    const safe = checkpointIndex >= 0 ? checkpoints[checkpointIndex] : spawn;
    player.x = safe.x; player.y = safe.y; player.vx = 0; player.vy = 0;
    player.grounded = true; player.frame = 0; projectiles.length = 0; bossShots.length = 0; shootPose = 0; muzzleFlash = 0;
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
  function destroyBoss() {
    if (!boss.alive) return;
    boss.alive = false; boss.active = false; boss.deathClock = 1.55; boss.explosionClock = 0; points += 2000; shake = 28;
    for (let n = 0; n < 5; n++) burstAt(boss.x + (Math.random() - .5) * 170, boss.y - 35 - Math.random() * 170);
    tone(72, .55, 'sawtooth', .075); tone(220, .7, 'square', .035);
    flash('NÚCLEO DESTRUÍDO!', 1200); updateHud();
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
    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
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
      if (!hit && boss.alive && boss.active && Math.abs(shot.x - boss.x) < 128 && shot.y > boss.y - 230 && shot.y < boss.y - 15) {
        hit = true; boss.hp--; boss.hitFlash = .17; shake = 5; burstAt(shot.x, shot.y);
        tone(145, .09, 'square', .04);
        if (boss.hp <= 0) destroyBoss(); else updateHud();
      }
      if (hit || shot.life <= 0 || shot.x < 0 || shot.x > WORLD_W) projectiles.splice(i, 1);
    }
  }
  function updateBoss(dt) {
    if (!boss.alive) return false;
    if (!boss.active && player.x > W * 6 + 1080) {
      boss.active = true;
      if (!boss.introduced) { boss.introduced = true; flash('GUARDIÃO DA FORJA — DESTRUA O NÚCLEO', 1700); tone(82, .5, 'sawtooth', .05); }
      updateHud();
    }
    if (!boss.active) return false;
    boss.x += boss.dir * 30 * dt;
    if (boss.x <= boss.min) { boss.x = boss.min; boss.dir = 1; }
    if (boss.x >= boss.max) { boss.x = boss.max; boss.dir = -1; }
    boss.shotClock -= dt;
    if (boss.shotClock <= 0) {
      boss.shotClock = 1.7;
      const dx = player.x - (boss.x - 120), dy = player.y - 112 - (boss.y - 122), distance = Math.max(1, Math.hypot(dx, dy));
      bossShots.push({ x: boss.x - 120, y: boss.y - 122, vx: dx / distance * 395, vy: dy / distance * 395, life: 4 });
      tone(104, .16, 'sawtooth', .045);
    }
    for (let i = bossShots.length - 1; i >= 0; i--) {
      const shot = bossShots[i]; shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
      if (Math.abs(shot.x - player.x) < 34 && shot.y > player.y - player.h * .82 && shot.y < player.y + 16) return true;
      if (shot.life <= 0 || shot.x < 0 || shot.x > WORLD_W) bossShots.splice(i, 1);
    }
    const pLeft = player.x - player.w * .3, pRight = player.x + player.w * .3, pTop = player.y - player.h * .86;
    return pRight > boss.x - 116 && pLeft < boss.x + 116 && player.y > boss.y - 218 && pTop < boss.y - 8;
  }
  function updateAftermath(dt) {
    if (boss.deathClock > 0) {
      boss.deathClock = Math.max(0, boss.deathClock - dt); boss.explosionClock -= dt;
      if (boss.explosionClock <= 0) {
        boss.explosionClock = .18; shake = Math.max(shake, 12);
        burstAt(boss.x + (Math.random() - .5) * 190, boss.y - 30 - Math.random() * 185);
        tone(70 + Math.random() * 55, .18, 'sawtooth', .045);
      }
      if (boss.deathClock === 0) { flash('PORTÃO DA FORJA ABRINDO', 1500); tone(165, .45, 'triangle', .045); }
    } else if (!boss.alive && gateProgress < 1) {
      gateProgress = Math.min(1, gateProgress + dt / 1.65);
      if (gateProgress >= 1) { shake = 8; tone(330, .25, 'triangle', .035); flash('PASSAGEM LIBERADA!', 1000); }
    }
  }
  function beginCelebration() {
    if (celebrating) return;
    celebrating = true; victoryClock = 0; victoryToneStep = 0; player.vx = 0; shootPose = 0; muzzleFlash = 0; keys.left = false; keys.right = false; keys.attack = false;
    ui.controls.classList.add('hidden'); flash('FORJA DOMINADA!', 1450);
  }
  function finishLevel() {
    celebrating = false; won = true; player.vx = 0; points += Math.max(0, 1000 - deaths * 100); updateSiren(false); setAudioLevel();
    const bronze = true;
    const silver = collected >= 14 && defeats >= 4;
    const gold = collected === collectibles.length && defeats === enemies.length && deaths <= 2;
    const stars = gold ? 3 : silver ? 2 : 1;
    const previous = loadProgress();
    const isRecord = points > previous.bestScore;
    const progress = { ...previous,
      bestScore: Math.max(previous.bestScore, points), bestStars: Math.max(previous.bestStars, stars), wins: previous.wins + 1,
      bestDeaths: previous.bestDeaths === null ? deaths : Math.min(previous.bestDeaths, deaths)
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch (_) {}
    ui.status.textContent = `FASE 1 CONCLUÍDA · QUEDAS ${deaths}`;
    ui.scrap.textContent = `SUCATA ${defeats}/${enemies.length}`;
    ui.score.textContent = `PONTOS ${String(points).padStart(4, '0')}`;
    ui.resultStars.textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
    ui.resultStats.textContent = `PONTOS  ${points}\nENGRENAGENS  ${collected}/${collectibles.length}\nSUCATA  ${defeats}/${enemies.length}\nGUARDIÃO  DERROTADO\nCAIXAS  ${crates.filter(crate => !crate.alive).length}/${crates.length}\nQUEDAS  ${deaths}`;
    ui.resultObjectives.innerHTML = `<span class="${bronze ? 'done' : ''}">★ DERROTAR<br>O GUARDIÃO</span><span class="${silver ? 'done' : ''}">★ 14 ENGRENAGENS<br>+ 4 SENTINELAS</span><span class="${gold ? 'done' : ''}">★ TUDO COLETADO<br>ATÉ 2 QUEDAS</span>`;
    ui.resultRecord.textContent = `${isRecord ? 'NOVO RECORDE! · ' : ''}MELHOR ${progress.bestScore} PTS · ${progress.bestStars}/3 ESTRELAS`;
    updateIntroRecord();
    updateMap();
    ui.result.classList.remove('hidden');
  }
  function updateCelebration(dt) {
    victoryClock += dt; player.frame = 1 + (Math.floor(victoryClock * 7) % 3);
    const nextTone = [0, .24, .48, .76, 1.05, 1.38];
    const notes = [330, 440, 523, 660, 784, 1047];
    if (victoryToneStep < nextTone.length && victoryClock >= nextTone[victoryToneStep]) {
      tone(notes[victoryToneStep], .28, 'triangle', .055); victoryToneStep++;
      burstAt(player.x + (Math.random() - .5) * 90, player.y - 130 - Math.random() * 70);
    }
    if (victoryClock >= 2.15) finishLevel();
  }
  function resetPhaseTwo(showText = false) {
    player.x = 165; player.y = 568; player.vx = 0; player.vy = 0; player.grounded = true; player.frame = 0; player.facing = 1;
    projectiles.length = 0; shootPose = 0; muzzleFlash = 0; cameraX = 0;
    if (showText) flash('METAL LÍQUIDO — RETORNANDO AO INÍCIO', 1000);
  }
  function phaseTwoFloor(prevFoot, nextFoot) {
    if (player.vy < 0) return null;
    const left = player.x - player.w * .3, right = player.x + player.w * .3;
    return phaseTwoPlatforms.find(p => right > p.x1 && left < p.x2 && prevFoot <= p.y + 5 && nextFoot >= p.y);
  }
  function updatePhaseTwoHud() {
    ui.status.textContent = `FASE 02 · ALTO-FORNO · QUEDAS ${phaseTwoState.deaths}`;
    ui.scrap.textContent = `SUCATA ${phaseTwoState.defeats}/1`;
    ui.score.textContent = `PONTOS ${String(phaseTwoState.points).padStart(4, '0')}`;
    ui.power.classList.add('hidden'); ui.bossHud.classList.add('hidden');
  }
  function updatePhaseTwoProjectiles(dt) {
    phaseTwoEnemy.hitFlash = Math.max(0, phaseTwoEnemy.hitFlash - dt);
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const shot = projectiles[i]; shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
      if (phaseTwoEnemy.alive && Math.abs(shot.x - phaseTwoEnemy.x) < 70 && shot.y > phaseTwoEnemy.y - 132 && shot.y < phaseTwoEnemy.y - 8) {
        phaseTwoEnemy.hp--; phaseTwoEnemy.hitFlash = .16; burstAt(shot.x, shot.y); tone(320, .07, 'square', .025);
        if (phaseTwoEnemy.hp <= 0) {
          phaseTwoEnemy.alive = false; phaseTwoState.defeats = 1; phaseTwoState.points += 300; burstAt(phaseTwoEnemy.x, phaseTwoEnemy.y - 72); flash('SENTINELA DO ALTO-FORNO DESTRUÍDO', 850);
        }
        projectiles.splice(i, 1); continue;
      }
      if (shot.life <= 0 || shot.x < 0 || shot.x > W) projectiles.splice(i, 1);
    }
  }
  function finishPhaseTwo() {
    tone(523, .25, 'triangle', .05); tone(784, .45, 'triangle', .035);
    phaseTwoState.won = true; phaseTwoState.playing = false; playing = false; player.vx = 0; updateSiren(false);
    phaseTwoState.points += Math.max(0, 500 - phaseTwoState.deaths * 50);
    const progress = { ...loadProgress(), phaseTwoPreviewCompleted: true, phaseTwoBest: Math.max(loadProgress().phaseTwoBest || 0, phaseTwoState.points) };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch (_) {}
    ui.controls.classList.add('hidden'); ui.phaseTwoStats.textContent = `PONTOS  ${phaseTwoState.points}\nENGRENAGENS  ${phaseTwoState.collected}/${phaseTwoGears.length}\nSUCATA  ${phaseTwoState.defeats}/1\nQUEDAS  ${phaseTwoState.deaths}`;
    updateMap(); ui.phaseTwoComplete.classList.remove('hidden');
  }
  function updateSteamParticles(dt, active) {
    phaseTwoState.steamSpawn -= dt;
    if (active) {
      while (phaseTwoState.steamSpawn <= 0) {
        phaseTwoState.steamSpawn += .035;
        const life = .72 + Math.random() * .48;
        steamParticles.push({ x: 1035 + (Math.random() - .5) * 38, y: 442 + Math.random() * 12, vx: (Math.random() - .5) * 62, vy: -285 - Math.random() * 165, life, maxLife: life, size: 22 + Math.random() * 27, phase: Math.random() * 6.28 });
      }
    } else phaseTwoState.steamSpawn = Math.max(0, phaseTwoState.steamSpawn);
    for (let i = steamParticles.length - 1; i >= 0; i--) {
      const puff = steamParticles[i]; puff.life -= dt; puff.phase += dt * 5.5; puff.x += (puff.vx + Math.sin(puff.phase) * 24) * dt; puff.y += puff.vy * dt; puff.vy *= Math.pow(.64, dt); puff.size += dt * 48;
      if (puff.life <= 0) steamParticles.splice(i, 1);
    }
  }
  function updatePhaseTwo(dt) {
    if (paused || phaseTwoState.won) return;
    phaseTwoState.clock += dt; shootPose = Math.max(0, shootPose - dt); muzzleFlash = Math.max(0, muzzleFlash - dt); shootCooldown = Math.max(0, shootCooldown - dt);
    if (keys.attack && shootCooldown <= 0) { fireRivet(); shootCooldown = .48; }
    updatePhaseTwoProjectiles(dt);
    shake *= Math.pow(.012, dt); if (shake < .2) shake = 0;
    const accel = player.grounded ? 2750 : 1750, target = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (target) { player.vx += target * accel * dt; player.facing = target; } else player.vx *= Math.pow(player.grounded ? .0006 : .07, dt);
    player.vx = Math.max(-455, Math.min(455, player.vx));
    if (keys.jump && player.grounded) { player.vy = -1120; player.grounded = false; keys.jump = false; }
    const prevFoot = player.y;
    player.x += player.vx * dt; player.vy += 2100 * dt; player.y += player.vy * dt; player.x = Math.max(42, Math.min(W - 42, player.x));
    const floor = phaseTwoFloor(prevFoot, player.y);
    if (floor) { player.y = floor.y; player.vy = 0; player.grounded = true; }
    else if (player.grounded) {
      const supported = phaseTwoPlatforms.some(p => player.x + player.w * .27 > p.x1 && player.x - player.w * .27 < p.x2 && Math.abs(player.y - p.y) < 8);
      if (!supported) player.grounded = false;
    }
    phaseTwoGears.forEach(item => {
      if (!item.picked && Math.abs(player.x - item.x) < 58 && item.y > player.y - player.h * .9 - 20 && item.y < player.y + 22) {
        item.picked = true; phaseTwoState.collected++; phaseTwoState.points += 100; burstAt(item.x, item.y); tone(820, .13, 'triangle', .045);
      }
    });
    if (phaseTwoEnemy.alive) {
      phaseTwoEnemy.x += phaseTwoEnemy.dir * 78 * dt;
      if (phaseTwoEnemy.x <= phaseTwoEnemy.min) { phaseTwoEnemy.x = phaseTwoEnemy.min; phaseTwoEnemy.dir = 1; }
      if (phaseTwoEnemy.x >= phaseTwoEnemy.max) { phaseTwoEnemy.x = phaseTwoEnemy.max; phaseTwoEnemy.dir = -1; }
      const hit = Math.abs(player.x - phaseTwoEnemy.x) < 68 && player.y > phaseTwoEnemy.y - 126 && player.y - player.h * .84 < phaseTwoEnemy.y - 8;
      if (hit) {
        if (player.vy > 120 && prevFoot <= phaseTwoEnemy.y - 100) {
          phaseTwoEnemy.hp = 0; phaseTwoEnemy.alive = false; phaseTwoState.defeats = 1; phaseTwoState.points += 300; player.vy = -680; burstAt(phaseTwoEnemy.x, phaseTwoEnemy.y - 70);
        } else { phaseTwoState.deaths++; resetPhaseTwo(); flash('ATINGIDO PELO SENTINELA — VOLTANDO AO INÍCIO', 1000); return; }
      }
    }
    const steamCycle = phaseTwoState.clock % 4.8, steamWarning = steamCycle >= 2.5 && steamCycle < 3.5, steamActive = steamCycle >= 3.5 && steamCycle < 4.45;
    updateSteamParticles(dt, steamActive);
    updateSiren(steamWarning);
    if (steamActive && Math.abs(player.x - 1035) < 54 && player.y > 320) { phaseTwoState.deaths++; resetPhaseTwo(); flash('ATINGIDO PELO VAPOR — VOLTANDO AO INÍCIO', 1000); return; }
    if (player.y > H + 120) { phaseTwoState.deaths++; resetPhaseTwo(true); return; }
    if (player.x > W - 105 && player.grounded) { finishPhaseTwo(); return; }
    if (!player.grounded) player.frame = player.vy < -120 ? 5 : player.vy > 240 ? 6 : 4;
    else if (Math.abs(player.vx) > 40) { player.runClock += dt * (7 + Math.abs(player.vx) / 105); player.frame = 1 + (Math.floor(player.runClock) % 3); }
    else player.frame = 0;
    updatePhaseTwoHud();
  }
  function update(dt) {
    updateParticles(dt);
    if (phaseTwoState.playing) { updatePhaseTwo(dt); return; }
    if (!playing || paused || won) return;
    updateAftermath(dt);
    if (celebrating) { updateCelebration(dt); updateHud(); return; }
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

    if (updateBoss(dt)) {
      deaths++; reset(false); flash('ATINGIDO PELO GUARDIÃO — O DANO NO NÚCLEO FOI MANTIDO', 1250); return;
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
    if (!won && player.x > WORLD_W - 205 && player.grounded && (boss.alive || gateProgress < .94)) {
      player.x = WORLD_W - 285; player.vx = 0; flash(boss.alive ? 'PORTÃO BLOQUEADO — DERROTE O GUARDIÃO' : 'AGUARDE — PORTÃO ABRINDO', 700);
    } else if (!won && player.x > WORLD_W - 205 && player.grounded) {
      beginCelebration();
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
    const victoryBob = celebrating ? Math.abs(Math.sin(victoryClock * 7)) * 18 : 0;
    ctx.save(); ctx.translate(player.x - cameraX, player.y - victoryBob);
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
  function drawBoss() {
    if ((!boss.alive && boss.deathClock <= 0) || !bossSprite.complete) return;
    const x = boss.x - cameraX; if (x < -280 || x > W + 280) return;
    const w = 270, h = 235;
    ctx.save(); ctx.translate(x + (boss.deathClock > 0 ? (Math.random() - .5) * 13 : 0), boss.y);
    if (!boss.alive) ctx.globalAlpha = Math.max(.18, boss.deathClock / 1.55);
    ctx.drawImage(bossSprite, -w / 2, -h, w, h);
    const pulse = .18 + Math.sin(performance.now() * .012) * .05;
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,87,8,${pulse})`;
    ctx.beginPath(); ctx.arc(24, -125, 52, 0, Math.PI * 2); ctx.fill();
    if (boss.hitFlash > 0) { ctx.globalAlpha = Math.min(1, boss.hitFlash * 5); ctx.drawImage(bossSprite, -w / 2, -h, w, h); }
    ctx.restore();
  }
  function drawGate() {
    const x = WORLD_W - 112 - cameraX, lift = gateProgress * 438, top = 110 - lift, width = 168, height = 438;
    if (x < -220 || x > W + 220 || gateProgress >= .995) return;
    ctx.save();
    const steel = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
    steel.addColorStop(0, '#15191b'); steel.addColorStop(.18, '#667074'); steel.addColorStop(.5, '#252b2e'); steel.addColorStop(.82, '#747d80'); steel.addColorStop(1, '#111416');
    ctx.fillStyle = steel; ctx.fillRect(x - width / 2, top, width, height);
    ctx.strokeStyle = '#0a0c0d'; ctx.lineWidth = 8; ctx.strokeRect(x - width / 2, top, width, height);
    for (let y = top + 42; y < top + height; y += 58) { ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fillRect(x - width / 2 + 7, y, width - 14, 7); }
    ctx.fillStyle = '#e27b18'; ctx.fillRect(x - width / 2 + 12, top + height - 40, width - 24, 19);
    ctx.fillStyle = '#16191b';
    for (let n = 0; n < 6; n++) { ctx.save(); ctx.translate(x - width / 2 + 18 + n * 27, top + height - 31); ctx.rotate(-.65); ctx.fillRect(-5, -17, 10, 34); ctx.restore(); }
    ctx.restore();
  }
  function drawBossShots() {
    bossShots.forEach(shot => {
      const x = shot.x - cameraX; if (x < -60 || x > W + 60) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(x, shot.y, 3, x, shot.y, 30);
      glow.addColorStop(0, '#fff6bc'); glow.addColorStop(.22, '#ffb21f'); glow.addColorStop(.6, 'rgba(255,65,0,.72)'); glow.addColorStop(1, 'rgba(255,20,0,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, shot.y, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd15a'; ctx.beginPath(); ctx.arc(x, shot.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
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
  function drawPhaseTwoObjects() {
    const now = performance.now();
    phaseTwoGears.forEach((item, i) => {
      if (item.picked) return;
      const bob = Math.sin(now * .004 + i) * 7;
      ctx.save(); ctx.translate(item.x, item.y + bob); ctx.rotate(now * .0022 + i); ctx.shadowColor = '#ff8a19'; ctx.shadowBlur = 24;
      const metal = ctx.createRadialGradient(-8, -10, 3, 0, 0, 31);
      metal.addColorStop(0, '#fff1b0'); metal.addColorStop(.22, '#ffb52f'); metal.addColorStop(.58, '#9a4b06'); metal.addColorStop(1, '#2c1a10');
      ctx.fillStyle = metal; ctx.beginPath();
      for (let n = 0; n < 24; n++) { const radius = n % 3 === 0 ? 31 : 24, angle = n / 24 * Math.PI * 2; const px = Math.cos(angle) * radius, py = Math.sin(angle) * radius; if (!n) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill(); ctx.fillStyle = '#16191b'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffe39b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
    if (phaseTwoEnemy.alive && sentinelSprite.complete) {
      ctx.save(); ctx.translate(phaseTwoEnemy.x, phaseTwoEnemy.y); if (phaseTwoEnemy.dir < 0) ctx.scale(-1, 1);
      ctx.drawImage(sentinelSprite, -72, -138, 144, 138);
      if (phaseTwoEnemy.hitFlash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, phaseTwoEnemy.hitFlash * 5); ctx.drawImage(sentinelSprite, -72, -138, 144, 138); }
      ctx.restore();
    }
    const steamCycle = phaseTwoState.clock % 4.8, warning = steamCycle >= 2.5 && steamCycle < 3.5;
    ctx.save();
    if (steamVentSprite.complete) ctx.drawImage(steamVentSprite, 960, 433, 150, 135);
    if (warning) {
      ctx.globalCompositeOperation = 'lighter'; const pulse = .45 + Math.sin(now * .018) * .22;
      const alarm = ctx.createRadialGradient(1081, 496, 3, 1081, 496, 31); alarm.addColorStop(0, `rgba(255,235,120,${pulse})`); alarm.addColorStop(.35, `rgba(255,55,10,${pulse})`); alarm.addColorStop(1, 'rgba(255,30,0,0)');
      ctx.fillStyle = alarm; ctx.beginPath(); ctx.arc(1081, 496, 31, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'screen';
    steamParticles.forEach(puff => {
      const ratio = Math.max(0, puff.life / puff.maxLife), alpha = Math.sin(Math.min(1, (1 - ratio) * 4) * Math.PI / 2) * Math.pow(ratio, .55) * .72;
      const cloud = ctx.createRadialGradient(puff.x - puff.size * .16, puff.y - puff.size * .14, puff.size * .08, puff.x, puff.y, puff.size);
      cloud.addColorStop(0, `rgba(255,255,255,${alpha})`); cloud.addColorStop(.35, `rgba(225,240,242,${alpha * .86})`); cloud.addColorStop(.72, `rgba(180,208,214,${alpha * .35})`); cloud.addColorStop(1, 'rgba(150,190,200,0)');
      ctx.fillStyle = cloud; ctx.beginPath(); ctx.ellipse(puff.x, puff.y, puff.size * .76, puff.size, Math.sin(puff.phase) * .2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    ctx.save(); ctx.translate(W - 72, 470); ctx.globalCompositeOperation = 'lighter';
    const beacon = ctx.createRadialGradient(0, 0, 4, 0, 0, 54); beacon.addColorStop(0, '#d8ffff'); beacon.addColorStop(.25, '#51d9ff'); beacon.addColorStop(1, 'rgba(20,120,255,0)'); ctx.fillStyle = beacon; ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function drawPhaseTwoScene() {
    ctx.fillStyle = '#050607'; ctx.fillRect(0, 0, W, H);
    ctx.save(); if (shake) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake * .55);
    if (phaseTwoBackground.complete) ctx.drawImage(phaseTwoBackground, 0, 0, W, H);
    drawAtmosphere(); drawPhaseTwoObjects(); drawProjectiles();
    if (heroSheet.complete) { drawHero(); drawWeapon(); }
    const heat = ctx.createLinearGradient(0, H, 0, 420); heat.addColorStop(0, 'rgba(255,70,0,.12)'); heat.addColorStop(1, 'rgba(255,70,0,0)'); ctx.fillStyle = heat; ctx.fillRect(0, 380, W, H - 380);
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
    if (phaseTwoState.playing || phaseTwoState.won) { drawPhaseTwoScene(); return; }
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
    drawBoss();
    drawBossShots();
    drawGate();
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
    phaseTwoState.playing = false; phaseTwoState.won = false;
    deaths = 0; defeats = 0; collected = 0; points = 0; checkpointIndex = -1; pressClock = 0;
    enemies.forEach(enemy => { enemy.x = enemy.startX; enemy.dir = enemy.startDir; enemy.alive = true; enemy.hp = 2; enemy.hitFlash = 0; });
    crates.forEach(crate => { crate.alive = true; crate.hp = 2; crate.hitFlash = 0; });
    collectibles.forEach(item => { item.x = item.startX; item.y = item.startY; item.picked = false; });
    presses.forEach(press => { press.wasDown = false; });
    boss.x = W * 6 + 1430; boss.dir = -1; boss.hp = boss.maxHp; boss.alive = true; boss.active = false; boss.introduced = false; boss.hitFlash = 0; boss.shotClock = 1.25; boss.deathClock = 0; boss.explosionClock = 0;
    projectiles.length = 0; bossShots.length = 0; powerups.length = 0; shootCooldown = 0; shootPose = 0; muzzleFlash = 0;
    magnetTimer = 0; spreadTimer = 0; gateProgress = 0; celebrating = false; victoryClock = 0; keys.attack = false; ui.power.classList.add('hidden');
    ui.result.classList.add('hidden'); ui.controls.classList.remove('hidden');
    paused = false; playing = true; reset(); setAudioLevel();
    flash('COLETE AS ENGRENAGENS E ALCANCE O PORTÃO', 1500);
  }
  function startPhaseTwo() {
    phaseTwoState.playing = true; phaseTwoState.won = false; phaseTwoState.deaths = 0; phaseTwoState.collected = 0; phaseTwoState.defeats = 0; phaseTwoState.points = 0; phaseTwoState.clock = 0; phaseTwoState.steamSpawn = 0;
    phaseTwoGears.forEach(item => { item.picked = false; });
    phaseTwoEnemy.x = phaseTwoEnemy.startX; phaseTwoEnemy.dir = 1; phaseTwoEnemy.hp = 2; phaseTwoEnemy.alive = true; phaseTwoEnemy.hitFlash = 0;
    projectiles.length = 0; powerups.length = 0; steamParticles.length = 0; shootCooldown = 0; magnetTimer = 0; spreadTimer = 0; keys.attack = false;
    ui.preview.classList.add('hidden'); ui.phaseTwoComplete.classList.add('hidden'); ui.result.classList.add('hidden'); ui.hud.classList.remove('hidden'); ui.controls.classList.remove('hidden');
    paused = false; playing = true; won = false; resetPhaseTwo(); updatePhaseTwoHud(); setAudioLevel(); flash('FASE 2 · ATRAVESSE O ALTO-FORNO', 1500);
  }
  bindHold('#left','left'); bindHold('#right','right'); bindHold('#jump','jump'); bindHold('#attack','attack');
  document.querySelector('#phase-one').addEventListener('click', () => {
    ui.map.classList.add('hidden'); ui.intro.classList.remove('hidden'); updateIntroRecord();
  });
  document.querySelector('#phase-two').addEventListener('click', () => {
    ui.map.classList.add('hidden'); ui.preview.classList.remove('hidden');
  });
  document.querySelector('#preview-back').addEventListener('click', () => {
    ui.preview.classList.add('hidden'); updateMap(); ui.map.classList.remove('hidden');
  });
  document.querySelector('#phase-two-start').addEventListener('click', () => {
    initSiren(); if (audioContext?.state === 'suspended') audioContext.resume(); startPhaseTwo();
  });
  document.querySelector('#phase-two-replay').addEventListener('click', startPhaseTwo);
  document.querySelector('#phase-two-map').addEventListener('click', () => {
    phaseTwoState.playing = false; phaseTwoState.won = false; playing = false; paused = false; updateSiren(false);
    ui.phaseTwoComplete.classList.add('hidden'); ui.hud.classList.add('hidden'); ui.controls.classList.add('hidden'); updateMap(); ui.map.classList.remove('hidden');
  });
  document.querySelector('#start').addEventListener('click', () => {
    initSiren(); if (audioContext?.state === 'suspended') audioContext.resume();
    ui.intro.classList.add('hidden'); ui.hud.classList.remove('hidden'); ui.controls.classList.remove('hidden');
    startNewRun();
  });
  updateIntroRecord();
  document.querySelector('#replay').addEventListener('click', startNewRun);
  document.querySelector('#back-map').addEventListener('click', () => {
    playing = false; paused = false; won = false; phaseTwoState.playing = false; phaseTwoState.won = false; keys.left = false; keys.right = false; keys.jump = false; keys.attack = false;
    updateSiren(false); setAudioLevel(); ui.result.classList.add('hidden'); ui.hud.classList.add('hidden'); ui.controls.classList.add('hidden');
    updateMap(); ui.map.classList.remove('hidden');
  });
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
