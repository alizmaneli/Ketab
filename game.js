let inputMode = "keyboard";
let canvas, ctx;
let player = { x: 400, y: 300, speed: 3 };
let target = null;
let keys = {};
let lastTime = 0;

// پس‌زمینه مترو (همونی که آپلود کردی)
let bgImg = new Image();
let bgReady = false;

// پایان مرحله مترو
let reachedEnd = false;
let endMessageShown = false;

function startGame(mode) {
  inputMode = mode;
  console.log("Game started with:", mode);

  document.body.innerHTML = `<canvas id="scene"></canvas>`;
  canvas = document.getElementById("scene");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setupInput();

  // اسم دقیق فایل تصویرت را اینجا گذاشتم
  bgImg.src = "assets/images/F318E535-88FD-4E70-A1E8-0BE5BC7C90E8.png";
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

    // اگر متن پایان مرحله روی صفحه است، با Enter ببندیمش
    if (reachedEnd && e.key === "Enter") {
      endMessageShown = false;
      // اینجا بعداً می‌ریم صحنه بعد (کتاب مادربزرگ)
      alert("پایان بخش مترو. بعداً وصلش می‌کنیم به صحنه‌ی کتاب.");
    }
  });
  document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  // کلیک = حرکت به آن نقطه (تا وقتی تو مرحله‌ی مترو هستیم)
  canvas.addEventListener("mousedown", e => {
    if (reachedEnd) return;
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
      if (reachedEnd) return;
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

  if (!reachedEnd) {
    update(dt);
  }
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

  // محدودیت کلی درون صفحه
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));

  // 🔒 ناحیه‌ی قابل حرکت روی «سطح» (با این عکس هماهنگ شده)
  const walkTop = canvas.height * 0.55;
  const walkBottom = canvas.height * 0.82;
  const walkLeft = canvas.width * 0.18;
  const walkRight = canvas.width * 0.82;

  if (player.y < walkTop) player.y = walkTop;
  if (player.y > walkBottom) player.y = walkBottom;
  if (player.x < walkLeft) player.x = walkLeft;
  if (player.x > walkRight) player.x = walkRight;

  // 🎯 نقطه‌ی پایان مرحله (گوشه راستِ جلو، جایی نزدیک انتهای ریل)
  const endZoneX = canvas.width * 0.78;
  const endZoneY = canvas.height * 0.78;
  const endRadius = 40;

  const dxEnd = player.x - endZoneX;
  const dyEnd = player.y - endZoneY;
  const distEnd = Math.hypot(dxEnd, dyEnd);

  if (distEnd < endRadius) {
    reachedEnd = true;
    endMessageShown = true;
  }
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
  ctx.fillStyle = "rgba(0,0,0,0.6)";
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

  // قهرمان (فعلاً نقطه)
  ctx.fillStyle = "#00ff4c";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // 🔵 (اختیاری) نمایش ناحیه پایان مرحله برای تست
  // می‌تونی این قسمت رو بعداً حذف کنی
  const endZoneX = canvas.width * 0.78;
  const endZoneY = canvas.height * 0.78;
  const endRadius = 40;
  ctx.strokeStyle = "rgba(0,150,255,0.4)";
  ctx.beginPath();
  ctx.arc(endZoneX, endZoneY, endRadius, 0, Math.PI * 2);
  ctx.stroke();

  // متن راهنما
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "کیبورد: W A S D یا جهت‌ها   |   تاچ/کلیک: روی هر نقطه تپ کن تا قهرمان به سمتش حرکت کند",
    20,
    30
  );

  if (endMessageShown) {
    drawEndMessage();
  }
}

function drawEndMessage() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";

  ctx.fillText("همین‌جاست...", w / 2, h / 2 - 40);
  ctx.font = "16px sans-serif";
  ctx.fillText(
    "صدای نفس دیو رو حس می‌کنی، ولی چیزی دیده نمی‌شه.",
    w / 2,
    h / 2
  );
  ctx.fillText(
    "یه‌هو یاد شعرهای مادربزرگ می‌افتی...",
    w / 2,
    h / 2 + 30
  );
  ctx.fillText("برای ادامه، Enter رو بزن (فعلاً فقط پیام تست میاد).", w / 2, h / 2 + 70);

  ctx.textAlign = "left";
}
