(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const W = canvas.width;
  const H = canvas.height;
  const TAU = Math.PI * 2;

  const keys = new Set();
  const mouse = { x: W / 2, y: H / 2, down: false };
  let muted = false;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lerp = (a, b, t) => a + (b - a) * t;

  const colors = {
    bg: "#03060d",
    grid: "rgba(92, 245, 255, 0.08)",
    cyan: "#5ff5ff",
    magenta: "#ff4fd8",
    red: "#ff445e",
    yellow: "#ffe66f",
    green: "#76ffb4",
    text: "#e8fbff",
    muted: "#9db3c1"
  };

  const state = {
    screen: "title",
    paused: false,
    time: 0,
    dt: 0,
    score: 0,
    wave: 1,
    best: Number(localStorage.getItem("traceBloomBest") || "0"),
    message: "",
    messageTimer: 0,
    cameraShake: 0
  };

  const player = {
    x: W / 2,
    y: H / 2,
    vx: 0,
    vy: 0,
    r: 13,
    speed: 260,
    signal: 100,
    energy: 100,
    invuln: 0
  };

  let leaks = [];
  let enemies = [];
  let packets = [];
  let particles = [];
  let trace = [];
  let stars = [];

  function resetGame() {
    state.screen = "playing";
    state.paused = false;
    state.time = 0;
    state.score = 0;
    state.wave = 1;
    state.message = "TRACE ONLINE";
    state.messageTimer = 2.0;
    state.cameraShake = 0;

    player.x = W / 2;
    player.y = H / 2;
    player.vx = 0;
    player.vy = 0;
    player.signal = 100;
    player.energy = 100;
    player.invuln = 1.0;

    leaks = [];
    enemies = [];
    packets = [];
    particles = [];
    trace = [];

    spawnStars();
    startWave(1);
  }

  function spawnStars() {
    stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: rand(0.5, 2.0),
      speed: rand(8, 38),
      phase: rand(0, TAU)
    }));
  }

  function startWave(wave) {
    leaks = [];
    enemies = [];
    packets = [];
    trace = [];

    const leakCount = Math.min(3 + Math.floor(wave / 3), 6);
    const enemyCount = 4 + wave * 2;

    for (let i = 0; i < leakCount; i++) {
      leaks.push({
        x: rand(90, W - 90),
        y: rand(90, H - 90),
        r: 24,
        progress: 0,
        stable: false,
        pulse: rand(0, TAU)
      });
    }

    for (let i = 0; i < enemyCount; i++) {
      spawnEnemy();
    }

    for (let i = 0; i < 4; i++) {
      spawnPacket();
    }

    announce(`WAVE ${wave}`);
  }

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) { x = rand(-50, W + 50); y = -30; }
    if (side === 1) { x = W + 30; y = rand(-50, H + 50); }
    if (side === 2) { x = rand(-50, W + 50); y = H + 30; }
    if (side === 3) { x = -30; y = rand(-50, H + 50); }

    const typeRoll = Math.random();
    const isCutter = typeRoll > 0.72;
    const isHunter = typeRoll < 0.22;

    enemies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      r: isCutter ? 15 : isHunter ? 18 : 13,
      speed: isCutter ? rand(95, 130) : isHunter ? rand(120, 160) : rand(80, 120),
      type: isCutter ? "cutter" : isHunter ? "hunter" : "noise",
      wobble: rand(0, TAU)
    });
  }

  function spawnPacket() {
    packets.push({
      x: rand(55, W - 55),
      y: rand(55, H - 55),
      r: 10,
      phase: rand(0, TAU)
    });
  }

  function announce(text) {
    state.message = text;
    state.messageTimer = 1.8;
  }

  function playTone(freq, duration, volume = 0.06) {
    if (muted) return;
    try {
      const audio = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch {
      // Audio is optional. The game should stay silent rather than fail.
    }
  }

  function isTracing() {
    return (keys.has(" ") || mouse.down) && player.energy > 1 && state.screen === "playing" && !state.paused;
  }

  function update(dt) {
    state.dt = dt;
    if (state.screen !== "playing" || state.paused) return;

    state.time += dt;
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    state.cameraShake = Math.max(0, state.cameraShake - dt * 24);
    player.invuln = Math.max(0, player.invuln - dt);

    updatePlayer(dt);
    updateLeaks(dt);
    updateEnemies(dt);
    updatePackets(dt);
    updateParticles(dt);
    updateStars(dt);
    updateTrace(dt);

    if (player.signal <= 0) {
      gameOver();
    }
  }

  function updatePlayer(dt) {
    let ax = 0;
    let ay = 0;

    if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
    if (keys.has("d") || keys.has("arrowright")) ax += 1;
    if (keys.has("w") || keys.has("arrowup")) ay -= 1;
    if (keys.has("s") || keys.has("arrowdown")) ay += 1;

    if (ax || ay) {
      const len = Math.hypot(ax, ay);
      ax /= len;
      ay /= len;
    }

    player.vx = lerp(player.vx, ax * player.speed, 0.18);
    player.vy = lerp(player.vy, ay * player.speed, 0.18);
    player.x = clamp(player.x + player.vx * dt, 22, W - 22);
    player.y = clamp(player.y + player.vy * dt, 22, H - 22);

    if (isTracing()) {
      player.energy = Math.max(0, player.energy - dt * 17);
      if (trace.length === 0 || Math.hypot(trace[trace.length - 1].x - player.x, trace[trace.length - 1].y - player.y) > 8) {
        trace.push({ x: player.x, y: player.y, life: 1.0 });
      }
      if (Math.random() < dt * 18) {
        spawnParticle(player.x, player.y, colors.cyan, 1.4, 0.7);
      }
    } else {
      player.energy = Math.min(100, player.energy + dt * 13);
    }
  }

  function updateTrace(dt) {
    for (const point of trace) {
      point.life -= dt * 0.085;
    }

    while (trace.length > 0 && trace[0].life <= 0) trace.shift();
    if (trace.length > 380) trace.splice(0, trace.length - 380);
  }

  function updateLeaks(dt) {
    let stableCount = 0;

    for (const leak of leaks) {
      leak.pulse += dt * 2.5;

      if (leak.stable) {
        stableCount++;
        continue;
      }

      const touching = Math.hypot(player.x - leak.x, player.y - leak.y) < leak.r + player.r;
      if (touching && isTracing()) {
        leak.progress += dt * 0.44;
        player.energy = Math.max(0, player.energy - dt * 8);

        if (Math.random() < dt * 42) {
          spawnParticle(leak.x + rand(-16, 16), leak.y + rand(-16, 16), colors.cyan, 2.2, 1.0);
        }

        if (leak.progress >= 1) {
          leak.stable = true;
          stableCount++;
          state.score += 450 + state.wave * 70;
          state.cameraShake = 8;
          announce("NODE BLOOMED");
          playTone(420 + state.wave * 12, 0.08, 0.045);
          for (let i = 0; i < 36; i++) {
            spawnParticle(leak.x, leak.y, Math.random() > 0.35 ? colors.cyan : colors.magenta, rand(1.2, 3.2), rand(0.45, 1.1));
          }
        }
      } else {
        leak.progress = Math.max(0, leak.progress - dt * 0.045);
      }
    }

    if (leaks.length > 0 && stableCount === leaks.length) {
      state.score += state.wave * 1000;
      state.wave += 1;
      player.signal = Math.min(100, player.signal + 16);
      player.energy = Math.min(100, player.energy + 35);
      startWave(state.wave);
    }
  }

  function nearestTarget(enemy) {
    if (enemy.type === "hunter") return player;

    const activeLeaks = leaks.filter(l => !l.stable);
    if (activeLeaks.length && Math.random() > 0.15) {
      let best = activeLeaks[0];
      let bestDist = dist(enemy, best);
      for (const leak of activeLeaks) {
        const d = dist(enemy, leak);
        if (d < bestDist) {
          best = leak;
          bestDist = d;
        }
      }
      return best;
    }

    return player;
  }

  function updateEnemies(dt) {
    const extraSpawnRate = 0.03 + state.wave * 0.009 + state.time * 0.0009;
    if (Math.random() < extraSpawnRate) spawnEnemy();

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.wobble += dt * 3.5;

      const target = nearestTarget(e);
      let dx = target.x - e.x;
      let dy = target.y - e.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      const wobbleX = Math.cos(e.wobble * 2.1) * 0.55;
      const wobbleY = Math.sin(e.wobble * 1.7) * 0.55;

      e.vx = lerp(e.vx, (dx + wobbleX) * e.speed, 0.05);
      e.vy = lerp(e.vy, (dy + wobbleY) * e.speed, 0.05);

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      if (dist(e, player) < e.r + player.r && player.invuln <= 0) {
        hurtPlayer(e.type === "hunter" ? 17 : 11);
        enemies.splice(i, 1);
        continue;
      }

      if (e.type === "cutter" && trace.length > 4) {
        for (let j = trace.length - 1; j >= 0; j -= 4) {
          const p = trace[j];
          if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + 6) {
            trace.splice(0, Math.max(0, j - 5));
            player.signal = Math.max(0, player.signal - 5);
            state.cameraShake = 5;
            spawnParticle(e.x, e.y, colors.red, 2.5, 0.7);
            break;
          }
        }
      }
    }
  }

  function hurtPlayer(amount) {
    player.signal = Math.max(0, player.signal - amount);
    player.invuln = 0.55;
    state.cameraShake = 12;
    announce("SIGNAL DAMAGED");
    playTone(120, 0.08, 0.05);
    for (let i = 0; i < 24; i++) {
      spawnParticle(player.x, player.y, colors.red, rand(1.2, 3.4), rand(0.3, 0.8));
    }
  }

  function updatePackets(dt) {
    if (packets.length < 5 && Math.random() < dt * 0.35) spawnPacket();

    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.phase += dt * 4;

      if (dist(p, player) < p.r + player.r) {
        player.energy = Math.min(100, player.energy + 35);
        player.signal = Math.min(100, player.signal + 5);
        state.score += 80;
        playTone(680, 0.04, 0.035);
        for (let k = 0; k < 14; k++) spawnParticle(p.x, p.y, colors.green, 1.8, 0.65);
        packets.splice(i, 1);
      }
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.size *= 0.992;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function updateStars(dt) {
    for (const s of stars) {
      s.y += s.speed * dt * 0.08;
      s.phase += dt;
      if (s.y > H + 4) {
        s.y = -4;
        s.x = Math.random() * W;
      }
    }
  }

  function spawnParticle(x, y, color, size, life) {
    const angle = rand(0, TAU);
    const speed = rand(20, 160);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size,
      life
    });
  }

  function gameOver() {
    state.screen = "gameover";
    state.best = Math.max(state.best, Math.floor(state.score));
    localStorage.setItem("traceBloomBest", String(state.best));
    announce("SIGNAL LOST");
    playTone(90, 0.2, 0.05);
  }

  function draw() {
    ctx.save();

    const shake = state.cameraShake > 0 ? state.cameraShake : 0;
    if (shake) {
      ctx.translate(rand(-shake, shake), rand(-shake, shake));
    }

    drawBackground();
    drawTrace();
    drawLeaks();
    drawPackets();
    drawEnemies();
    drawParticles();
    drawPlayer();
    drawHud();

    if (state.screen === "title") drawTitle();
    if (state.paused && state.screen === "playing") drawOverlay("PAUSED", "Press P to resume");
    if (state.screen === "gameover") drawGameOver();

    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    const offset = (state.time * 14) % 40;
    for (let x = -40 + offset; x < W + 40; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    for (let y = -40 + offset * 0.5; y < H + 40; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    for (const s of stars) {
      const alpha = 0.22 + Math.sin(s.phase) * 0.12;
      ctx.fillStyle = `rgba(95, 245, 255, ${alpha})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    const pulse = 0.5 + Math.sin(state.time * 0.8) * 0.5;
    ctx.strokeStyle = `rgba(255, 79, 216, ${0.05 + pulse * 0.06})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W * 0.78, H * 0.28, 120 + pulse * 18, 0, TAU);
    ctx.stroke();

    const vignette = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 520);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTrace() {
    if (trace.length < 2) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(95, 245, 255, 0.16)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(trace[0].x, trace[0].y);
    for (const p of trace) ctx.lineTo(p.x, p.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(95, 245, 255, 0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trace[0].x, trace[0].y);
    for (const p of trace) ctx.lineTo(p.x, p.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 79, 216, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(trace[0].x + 2, trace[0].y - 2);
    for (const p of trace) ctx.lineTo(p.x + 2, p.y - 2);
    ctx.stroke();
  }

  function drawLeaks() {
    for (const leak of leaks) {
      const pulse = 0.5 + Math.sin(leak.pulse) * 0.5;
      const progress = clamp(leak.progress, 0, 1);

      ctx.save();
      ctx.translate(leak.x, leak.y);

      ctx.strokeStyle = leak.stable ? "rgba(118, 255, 180, 0.85)" : "rgba(95, 245, 255, 0.80)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, leak.r + pulse * 5, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = leak.stable ? colors.green : colors.cyan;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, leak.r - 7, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
      ctx.stroke();

      ctx.fillStyle = leak.stable ? "rgba(118, 255, 180, 0.2)" : "rgba(95, 245, 255, 0.13)";
      ctx.beginPath();
      ctx.arc(0, 0, leak.r - 10, 0, TAU);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawPackets() {
    for (const p of packets) {
      const bob = Math.sin(p.phase) * 3;
      ctx.save();
      ctx.translate(p.x, p.y + bob);
      ctx.rotate(p.phase * 0.4);
      ctx.fillStyle = "rgba(118, 255, 180, 0.20)";
      ctx.fillRect(-14, -14, 28, 28);
      ctx.strokeStyle = colors.green;
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.fillStyle = colors.green;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }
  }

  function drawEnemies() {
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(Math.atan2(e.vy, e.vx) + Math.PI / 2);

      if (e.type === "hunter") {
        ctx.fillStyle = "rgba(255, 68, 94, 0.18)";
        ctx.beginPath();
        ctx.arc(0, 0, e.r + 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = colors.red;
        ctx.beginPath();
        ctx.moveTo(0, -e.r - 8);
        ctx.lineTo(e.r + 7, e.r);
        ctx.lineTo(0, e.r * 0.55);
        ctx.lineTo(-e.r - 7, e.r);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === "cutter") {
        ctx.strokeStyle = colors.magenta;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-e.r, -e.r);
        ctx.lineTo(e.r, e.r);
        ctx.moveTo(e.r, -e.r);
        ctx.lineTo(-e.r, e.r);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 79, 216, 0.25)";
        ctx.fillRect(-e.r, -e.r, e.r * 2, e.r * 2);
      } else {
        ctx.fillStyle = "rgba(255, 68, 94, 0.18)";
        ctx.beginPath();
        ctx.arc(0, 0, e.r + 7, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = colors.red;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU;
          const r = e.r + Math.sin(e.wobble + i) * 4;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }

  function drawPlayer() {
    const tracing = isTracing();
    const pulse = 0.5 + Math.sin(state.time * 8) * 0.5;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(Math.atan2(player.vy, player.vx || 0.001) * 0.08);

    if (player.invuln > 0 && Math.sin(state.time * 32) > 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = tracing ? "rgba(95, 245, 255, 0.22)" : "rgba(95, 245, 255, 0.10)";
    ctx.beginPath();
    ctx.arc(0, 0, player.r + 12 + pulse * 3, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#07121e";
    ctx.strokeStyle = colors.cyan;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -player.r - 6);
    ctx.lineTo(player.r + 8, 0);
    ctx.lineTo(0, player.r + 6);
    ctx.lineTo(-player.r - 8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tracing ? colors.magenta : colors.cyan;
    ctx.beginPath();
    ctx.arc(0, 0, 6 + pulse * 2, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  function drawHud() {
    drawBar(24, 22, 190, 12, player.signal / 100, colors.red, "SIGNAL");
    drawBar(24, 46, 190, 12, player.energy / 100, colors.cyan, "TRACE");

    ctx.fillStyle = colors.text;
    ctx.font = "16px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.fillText(`SCORE ${Math.floor(state.score)}`, 740, 32);
    ctx.fillText(`BEST ${Math.floor(state.best)}`, 740, 55);
    ctx.fillText(`WAVE ${state.wave}`, 740, 78);

    if (state.messageTimer > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(state.messageTimer, 0, 1);
      ctx.fillStyle = colors.cyan;
      ctx.font = "bold 28px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(state.message, W / 2, 62);
      ctx.restore();
    }
  }

  function drawBar(x, y, w, h, value, color, label) {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * clamp(value, 0, 1), h);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = colors.muted;
    ctx.font = "11px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.fillText(label, x, y + 24);
  }

  function drawTitle() {
    drawOverlay("TRACE BLOOM", "Press R to start - stabilize all cyan leaks");
    ctx.fillStyle = colors.muted;
    ctx.font = "16px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("Hold SPACE or LEFT MOUSE to draw a live trace", W / 2, H / 2 + 88);
    ctx.fillText("Avoid red noise pulses. Green packets refill trace energy.", W / 2, H / 2 + 114);
    ctx.textAlign = "left";
  }

  function drawGameOver() {
    drawOverlay("SIGNAL LOST", `Score ${Math.floor(state.score)} - Best ${Math.floor(state.best)} - Press R`);
  }

  function drawOverlay(title, subtitle) {
    ctx.fillStyle = "rgba(3, 6, 13, 0.78)";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(95, 245, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.strokeRect(W / 2 - 250, H / 2 - 95, 500, 185);

    ctx.fillStyle = colors.text;
    ctx.font = "bold 44px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(title, W / 2, H / 2 - 14);

    ctx.fillStyle = colors.muted;
    ctx.font = "16px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.fillText(subtitle, W / 2, H / 2 + 28);
    ctx.textAlign = "left";
  }

  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;

    update(dt);
    draw();

    requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    keys.add(key);

    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
    }

    if (key === "r") resetGame();
    if (key === "p" && state.screen === "playing") state.paused = !state.paused;
    if (key === "m") {
      muted = !muted;
      announce(muted ? "AUDIO MUTED" : "AUDIO ONLINE");
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener("pointerdown", (event) => {
    mouse.down = true;
    updateMouse(event);
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointerup", (event) => {
    mouse.down = false;
    canvas.releasePointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", updateMouse);

  function updateMouse(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * W;
    mouse.y = ((event.clientY - rect.top) / rect.height) * H;
  }

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  spawnStars();
  requestAnimationFrame(loop);
})();
