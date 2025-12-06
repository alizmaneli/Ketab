let inputMode = "keyboard";
let keys = {};
let canvas, ctx;
let player = { x: 400, y: 300, speed: 2.5 };
let lastTime = 0;

// شروع بازی از دکمه‌ها
function startGame(mode) {
  inputMode = mode;
  console.log("Game started with: " + mode);

  // تمام محتویات body رو پاک کن و فقط canvas بذار
  document.body.innerHTML = `
    <canvas id="scene"></canvas>
  `;

  canvas = document.getElementById("scene");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setupInput();
  requestAnimationFrame(gameLoop);
}

// تنظیم اندازه‌ی بوم (کل صفحه)
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ورودی‌ها (کیبورد + تاچ)
function setupInput() {
  // کیبورد
  window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  // تاچ ساده: لمس نیمه‌ی صفحه
  if (inputMode === "touch") {
    canvas.addEventListener("touchstart", handleTouch);
    canvas.addEventListener("touchmove", handleTouch);
    canvas.addEventListener("touchend", () => {
      keys = {}; // رها شدن همه جهت‌ها
    });
  }
}

function handleTouch(e) {
  e.preventDefault();
  keys = {};
  const touch = e.touches[0];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (!touch) return;

  const x = touch.clientX;
  const y = touch.clientY;

  if (y < cy * 0.9) keys["w"] = true;      // بالا
  if (y > cy * 1.1) keys["s"] = true;      // پایین
  if (x < cx * 0.9) keys["a"] = true;      // چپ
  if (x > cx * 1.1) keys["d"] = true;      // راست
}

// حلقه اصلی بازی
function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 16.67; // نسبت به 60fps
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

// به‌روزرسانی موقعیت قهرمان
function update(dt) {
  let vx = 0, vy = 0;

  if (keys["w"] || keys["arrowup"]) vy -= 1;
  if (keys["s"] || keys["arrowdown"]) vy += 1;
  if (keys["a"] || keys["arrowleft"]) vx -= 1;
  if (keys["d"] || keys["arrowright"]) vx += 1;

  const len = Math.hypot(vx, vy) || 1;
  vx /= len;
  vy /= len;

  player.x += vx * player.speed * dt;
  player.y += vy * player.speed * dt;

  // محدود کردن داخل صفحه
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));
}

// رسم صحنه: تونل تاریک + چراغ‌قوه
function draw() {
  // پس‌زمینه مترو (خیلی ساده فعلاً)
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // دیوارهای ساده تونل
  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height * 0.2, canvas.width, 10);           // سقف
  ctx.fillRect(0, canvas.height * 0.8, canvas.width, 10);           // کف
  ctx.fillRect(canvas.width * 0.1, 0, 10, canvas.height);           // ستون چپ
  ctx.fillRect(canvas.width * 0.9, 0, 10, canvas.height);           // ستون راست

  // تاریکی کامل
  ctx.fillStyle = "rgba(0,0,0,0.96)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // چراغ‌قوه دور قهرمان: دایره‌ی روشن
  const grd = ctx.createRadialGradient(
    player.x, player.y, 0,
    player.x, player.y, 180
  );
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.4)");
  grd.addColorStop(1, "rgba(0,0,0,0)");

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // نقطه‌ی قهرمان (فقط برای تست)
  ctx.fillStyle = "#0f0";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // متن راهنما
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("با W A S D یا جهت‌ها حرکت کن. در حالت تاچ، صفحه را لمس کن.", 20, 30);
}
