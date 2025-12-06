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
  // پس‌زمینه تونل ساده
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height * 0.2, canvas.width, 10);
  ctx.fillRect(0, canvas.height * 0.8, canvas.width, 10);
  ctx.fillRect(canvas.width * 0.1, 0, 10, canvas.height);
  ctx.fillRect(canvas.width * 0.9, 0, 10, canvas.height);

  // تاریکی
  ctx.fillStyle = "rgba(0,0,0,0.97)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // چراغ‌قوه
  const g = ctx.createRadialGradient(
    player.x, player.y, 0,
    player.x, player.y, 180
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // قهرمان
  ctx.fillStyle = "#0f0";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // راهنما
  ctx.fillStyle = "#fff";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "کیبورد: W A S D یا جهت‌ها   |   تاچ/کلیک: روی هر نقطه تپ کن تا قهرمان به سمتش حرکت کند",
    20,
    30
  );
}
