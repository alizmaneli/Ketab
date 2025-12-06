let inputMode = "keyboard";
let canvas, ctx;
let player = { x: 400, y: 300, speed: 3 };
let target = null;
let keys = {};
let lastTime = 0;

// پس‌زمینه مترو
let bgImg = new Image();
let bgReady = false;

function startGame(mode) {
  inputMode = mode;
  console.log("Game started with:", mode);

  document.body.innerHTML = `<canvas id="scene"></canvas>`;
  canvas = document.getElementById("scene");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setupInput();

  // لود تصویر پس‌زمینه
  bgImg.src = "assets/images/F318E535-88FD-4E70-A1E8-D8E5BC7C90E8.png"; // اگر اسم دیگری گذاشتی همین‌جا عوض کن
  bgImg.onload = () => {
    bgReady = true;
  };

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

  // کلیک = حرکت به آن نقطه
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

  // اگر کیبورد استفاده نمی‌شه و target داریم → حرکت به سمت هدف
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

function draw() {
  // پس‌زمینه مترو
  if (bgReady) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // کمی تاریکی روی کل صحنه
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // چراغ‌قوه دور قهرمان
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

  // قهرمان
  ctx.fillStyle = "#00ff4c";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // متن راهنما
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "کیبورد: W A S D یا جهت‌ها   |   تاچ/کلیک: روی هر نقطه تپ کن تا قهرمان به سمتش حرکت کند",
    20,
    30
  );
}
  ctx.fillStyle = "#ff4444";
  ctx.fillText("BG: " + (bgReady ? "OK" : "NOT LOADED"), 20, 50);
