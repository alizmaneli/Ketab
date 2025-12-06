let inputMode = "keyboard";
let canvas, ctx;
let player = { x: 400, y: 300, speed: 3 };
let target = null; // مقصد برای حرکت
let keys = {};
let lastTime = 0;

function startGame(mode) {
  inputMode = mode;
  console.log("Game started with:", mode);

  document.body.innerHTML = `<canvas id="scene"></canvas>`;
  canvas = document.getElementById("scene");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setupInput();

  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ورودی‌ها
function setupInput() {
  // کیبورد – همیشه فعال
  document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
  });
  document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  // کلیک موس → حرکت به همون نقطه
  canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    target = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  });

  // تاچ → فقط روی touchend مقصد رو تنظیم می‌کنیم (احساس "تپ" ساده)
  canvas.addEventListener("touchend", e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.changedTouches[0];
    if (!t) return;

    target = {
      x: t.clientX - rect.left,
      y: t.clientY - rect.top
    };
  }, { passive: false });
}

// حلقه بازی
function gameLoop(ts) {
  const dt = (ts - lastTime) / 16.67;
  lastTime = ts;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  let vx = 0, vy = 0;

  // کنترل با کیبورد
  if (keys["w"] || keys["arrowup"]) vy -= 1;
  if (keys["s"] || keys["arrowdown"]) vy += 1;
  if (keys["a"] || keys["arrowleft"]) vx -= 1;
  if (keys["d"] || keys["arrowright"]) vx += 1;

  // اگر کیبورد استفاده نمی‌شه و target داریم → به سمت هدف برو
  if (vx === 0 && vy === 0 && target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
      vx = dx / dist;
      vy = dy / dist;
    } else {
      target = null; // رسیدیم
    }
  }

  const len = Math.hypot(vx, vy) || 1;
  vx /= len;
  vy /= len;

  player.x += vx * player.speed * dt;
  player.y += vy * player.speed * dt;

  // محدودیت داخل صفحه
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));
}

// رسم صحنه + چراغ‌قوه
function draw() {
  // پس‌زمینه کاملاً سیاه
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // چراغ‌قوه اطراف قهرمان (دایره روشن روی پس‌زمینه سیاه)
  const r = 260; // شعاع نور
  const g = ctx.createRadialGradient(
    player.x, player.y, 0,
    player.x, player.y, r
  );
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.4, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.fillRect(player.x - r, player.y - r, r * 2, r * 2);

  // دیوارهای تونل را داخل همین نور با رنگ کمی روشن‌تر می‌کشیم
  ctx.strokeStyle = "rgba(80,80,80,0.8)";
  ctx.lineWidth = 4;

  // سقف
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.2);
  ctx.lineTo(canvas.width, canvas.height * 0.2);
  ctx.stroke();

  // کف
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.8);
  ctx.lineTo(canvas.width, canvas.height * 0.8);
  ctx.stroke();

  // ستون چپ
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.1, 0);
  ctx.lineTo(canvas.width * 0.1, canvas.height);
  ctx.stroke();

  // ستون راست
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.9, 0);
  ctx.lineTo(canvas.width * 0.9, canvas.height);
  ctx.stroke();

  // قهرمان (نقطه سبز)
  ctx.fillStyle = "#0f0";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // متن راهنما
  ctx.fillStyle = "#fff";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "کیبورد: W A S D یا جهت‌ها   |   تاچ/کلیک: روی نقطه‌ای که می‌خوای برو لمس کن/کلیک کن",
    20,
    30
  );
}
