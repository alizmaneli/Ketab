let inputMode = "keyboard";
let canvas, ctx;
let player = { x: 400, y: 300, speed: 3 };
let target = null;
let keys = {};
let lastTime = 0;

function startGame(mode) {
  inputMode = mode;
  console.log("Game started with:", mode);

  document.body.innerHTML = `<canvas id="scene"></canvas>`;
  canvas = document.getElementById("scene");
  const context = canvas.getContext("2d", { alpha: true });
  ctx = context;

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setupInput();
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setupInput() {
  // کیبورد
  document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
  });
  document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  // کلیک موس = حرکت به آن نقطه
  canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    target = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  });

  // تاچ = تپ به نقطه مقصد
  canvas.addEventListener(
    "touchend",
    e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.changedTouches[0];
      if (!t) return;
      target = {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top
      };
    },
    { passive: false }
  );
}

function gameLoop(ts) {
  const dt = (ts - lastTime) / 16.67;
  lastTime = ts;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  let vx = 0,
    vy = 0;

  // کیبورد
  if (keys["w"] || keys["arrowup"]) vy -= 1;
  if (keys["s"] || keys["arrowdown"]) vy += 1;
  if (keys["a"] || keys["arrowleft"]) vx -= 1;
  if (keys["d"] || keys["arrowright"]) vx += 1;

  // اگر کیبورد استفاده نشه و target داریم → حرکت به سمت هدف
  if (vx === 0 && vy === 0 && target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 2) {
      vx = dx / dist;
      vy = dy / dist;
    } else {
      target = null;
    }
  }

  const len = Math.hypot(vx, vy) || 1;
  vx /= len;
  vy /= len;

  player.x += vx * player.speed * dt;
  player.y += vy * player.speed * dt;

  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));
}

function drawTunnelBackground() {
  const w = canvas.width;
  const h = canvas.height;
  const midX = w / 2;
  const floorY = h * 0.8;
  const ceilY = h * 0.25;

  // گرادیان کلی فضا (بالا کمی آبی، پایین تیره)
  let bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#050716");
  bgGrad.addColorStop(0.5, "#050509");
  bgGrad.addColorStop(1, "#020204");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();

  // دیوارهای چپ و راست (پلیگون با پرسپکتیو)
  ctx.fillStyle = "#14141a";

  // دیوار چپ
  ctx.beginPath();
  ctx.moveTo(w * 0.02, 0);
  ctx.lineTo(w * 0.18, ceilY);
  ctx.lineTo(w * 0.18, floorY);
  ctx.lineTo(w * 0.05, h);
  ctx.closePath();
  ctx.fill();

  // دیوار راست
  ctx.beginPath();
  ctx.moveTo(w * 0.98, 0);
  ctx.lineTo(w * 0.82, ceilY);
  ctx.lineTo(w * 0.82, floorY);
  ctx.lineTo(w * 0.95, h);
  ctx.closePath();
  ctx.fill();

  // سقف تونل
  let ceilGrad = ctx.createLinearGradient(0, ceilY - 40, 0, ceilY + 40);
  ceilGrad.addColorStop(0, "#05060b");
  ceilGrad.addColorStop(0.5, "#101018");
  ceilGrad.addColorStop(1, "#05060b");
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(w * 0.18, ceilY - 40, w * 0.64, 80);

  // کف سکو
  let floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  floorGrad.addColorStop(0, "#181818");
  floorGrad.addColorStop(1, "#050505");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(w * 0.05, floorY, w * 0.9, h - floorY);

  // ریل‌ها
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, floorY);
  ctx.lineTo(midX - w * 0.02, h * 0.6);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w * 0.72, floorY);
  ctx.lineTo(midX + w * 0.02, h * 0.6);
  ctx.stroke();

  // تخته‌های بین ریل‌ها
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const y1 = floorY - t * (floorY - h * 0.6);
    const xLeft = w * 0.28 - t * (w * 0.28 - (midX - w * 0.02));
    const xRight = w * 0.72 - t * (w * 0.72 - (midX + w * 0.02));

    ctx.beginPath();
    ctx.moveTo(xLeft, y1);
    ctx.lineTo(xRight, y1);
    ctx.stroke();
  }

  // ستون‌های دیوار
  ctx.strokeStyle = "rgba(90,90,100,0.9)";
  ctx.lineWidth = 3;
  const colCount = 6;
  for (let i = 0; i <= colCount; i++) {
    const t = i / colCount;
    const xBottom = w * 0.18 + (w * 0.64) * t;
    const xTop = midX + (xBottom - midX) * 0.3;

    ctx.beginPath();
    ctx.moveTo(xBottom, floorY);
    ctx.lineTo(xTop, ceilY);
    ctx.stroke();
  }

  // چراغ‌های سقفی
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5;
    const x = midX;
    const y = ceilY - 10 - t * 10;

    let lampGrad = ctx.createRadialGradient(x, ceilY, 0, x, ceilY, 80);
    lampGrad.addColorStop(0, "rgba(255,240,200,0.9)");
    lampGrad.addColorStop(0.4, "rgba(255,240,200,0.35)");
    lampGrad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.arc(x, ceilY, 80, 0, Math.PI * 2);
    ctx.fill();

    // خود چراغ
    ctx.fillStyle = "#f5e3b2";
    ctx.fillRect(midX - 40, ceilY - 6, 80, 12);
  }

  // خط زرد لبه‌ی سکو
  ctx.fillStyle = "#c2a400";
  ctx.fillRect(w * 0.05, floorY - 4, w * 0.9, 3);

  ctx.restore();
}

function draw() {
  const w = canvas.width;
  const h = canvas.height;

  // ۱) تونل مترو
  drawTunnelBackground();

  // ۲) تاریک کردن کل صحنه
  ctx.fillStyle = "rgba(0,0,0,0.86)";
  ctx.fillRect(0, 0, w, h);

  // ۳) چراغ‌قوه دور قهرمان
  const r = 260;
  const g = ctx.createRadialGradient(
    player.x,
    player.y,
    0,
    player.x,
    player.y,
    r
  );
  g.addColorStop(0, "rgba(255,245,220,0.95)");
  g.addColorStop(0.4, "rgba(255,245,220,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
  ctx.fill();

  // ۴) خود قهرمان (نقطه سبز فعلاً)
  ctx.fillStyle = "#00ff4c";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // ۵) متن راهنما
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "کیبورد: W A S D یا جهت‌ها   |   تاچ/کلیک: روی هر نقطه تپ کن تا قهرمان به سمتش حرکت کند",
    20,
    30
  );
}
