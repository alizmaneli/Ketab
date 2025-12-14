const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ================= GAME STATE =================
let gameState = "menu"; // "menu" | "play"

// ================= BACKGROUND =================
const bg = new Image();
bg.src = "assets/images/metro-bg.PNG?v=" + Date.now();

// ================= WALK POLYGON (FROM YOU) =================
const walkPoly = [
  { x: canvas.width * 0.0050, y: canvas.height * 0.9136 },
  { x: canvas.width * 0.4557, y: canvas.height * 0.5097 },
  { x: canvas.width * 0.5050, y: canvas.height * 0.5127 },
  { x: canvas.width * 0.9958, y: canvas.height * 0.9136 }
];

// ====== perspective bounds (top/bottom of the walk area)
const walkTopY = Math.min(...walkPoly.map(p => p.y));
const walkBottomY = Math.max(...walkPoly.map(p => p.y));

// ================= GEOMETRY =================
function pointInPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      ((yi > p.y) !== (yj > p.y)) &&
      (p.x < (xj - xi) * (p.y - yi) / (yj - yi + 1e-9) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function circleInsidePoly(cx, cy, r, poly) {
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (!pointInPoly({ x: px, y: py }, poly)) return false;
  }
  return true;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// ================= PERSPECTIVE SCALE =================
// هرچی y کمتر (دورتر/بالا) => کوچک‌تر
// این دو تا رو اگر خواستی حسش رو عوض کنی تغییر بده:
const SCALE_NEAR = 1.00; // پایین صحنه (نزدیک دوربین)
const SCALE_FAR  = 0.55; // بالای محدوده (دور)

function scaleAtY(y) {
  const t = clamp((y - walkTopY) / (walkBottomY - walkTopY + 1e-9), 0, 1);
  return SCALE_FAR + (SCALE_NEAR - SCALE_FAR) * t;
}

// ================= PLAYER =================
const player = {
  x: canvas.width * 0.50,
  y: canvas.height * 0.80,
  baseR: 18,      // اندازه پایه
  speed: 3.5,
  hp: 100,
  target: null
};

function playerScale() {
  return scaleAtY(player.y);
}

function playerRadius() {
  return player.baseR * playerScale();
}

// ================= ENEMIES (simple chase, no player attack) =================
const enemies = [];
const ENEMY_MAX = 3;

const enemyTemplate = {
  baseR: 18,
  speed: 2.0,
  damage: 6,
  attackRange: 28,
  attackCooldown: 700
};

function enemyScaleAtY(y) {
  return scaleAtY(y);
}

function enemyRadius(e) {
  return e.baseR * enemyScaleAtY(e.y);
}

function randomPointInWalkPoly(r) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of walkPoly) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  for (let i = 0; i < 600; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (circleInsidePoly(x, y, r, walkPoly)) return { x, y };
  }
  return { x: canvas.width * 0.5, y: canvas.height * 0.8 };
}

function spawnEnemy() {
  // اسپاون بر اساس سایز دوربین (نزدیک‌تر بزرگ‌تر، دورتر کوچک‌تر) مهم نیست، فقط داخل پلی‌گان
  const tmp = { baseR: enemyTemplate.baseR, y: canvas.height * 0.75 };
  const r = enemyRadius(tmp);
  const p = randomPointInWalkPoly(r);

  enemies.push({
    x: p.x,
    y: p.y,
    baseR: enemyTemplate.baseR,
    speed: enemyTemplate.speed,
    lastHit: 0
  });
}

function maintainEnemies() {
  while (enemies.length < ENEMY_MAX) spawnEnemy();
}

// ================= INPUT =================
// حرکت با کلیک/تاچ (نه Space، نه کلیک راست)
function pointerToCanvasXY(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

canvas.addEventListener("click", (e) => {
  if (gameState !== "play") return;

  const p = pointerToCanvasXY(e.clientX, e.clientY);
  const r = playerRadius();
  if (circleInsidePoly(p.x, p.y, r, walkPoly)) {
    player.target = { x: p.x, y: p.y };
  }
});

// Menu start
canvas.addEventListener("mousedown", (e) => {
  if (gameState !== "menu") return;

  const p = pointerToCanvasXY(e.clientX, e.clientY);
  if (p.x > 450 && p.x < 750 && p.y > 360 && p.y < 420) {
    gameState = "play";
  }
});

// کیبورد فقط برای “کارهای خاص” (فعلاً خالی/آماده توسعه)
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ================= UPDATE =================
function updatePlayer() {
  if (!player.target) return;

  const d = dist(player.x, player.y, player.target.x, player.target.y);
  if (d < 3) {
    player.target = null;
    return;
  }

  const dx = (player.target.x - player.x) / (d || 1);
  const dy = (player.target.y - player.y) / (d || 1);

  const nx = player.x + dx * player.speed;
  const ny = player.y + dy * player.speed;

  // با مقیاس جدید، برخورد هم باید با r جدید چک بشه
  const r = playerRadius();
  if (circleInsidePoly(nx, ny, r, walkPoly)) {
    player.x = nx;
    player.y = ny;
  } else {
    // اگر هدف بیرون افتاد یا به مرز خورد، هدف رو پاک کن
    player.target = null;
  }

  // مثال برای “کارهای خاص” (فعلاً فقط نمونه، بدون Space/RightClick):
  // اگر خواستی بعداً اینا رو واقعی می‌کنیم:
  // if (keys["q"]) { /* dash */ }
  // if (keys["e"]) { /* skill */ }
  // if (keys["f"]) { /* interact */ }
}

function updateEnemies() {
  const now = performance.now();

  for (const e of enemies) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;

    const step = e.speed;
    const nx = e.x + (dx / d) * step;
    const ny = e.y + (dy / d) * step;

    const er = enemyRadius(e);
    if (circleInsidePoly(nx, ny, er, walkPoly)) {
      e.x = nx;
      e.y = ny;
    }

    const pr = playerRadius();
    const hitDist = pr + er;
    if (d < hitDist + enemyTemplate.attackRange) {
      if (now - e.lastHit > enemyTemplate.attackCooldown) {
        e.lastHit = now;
        player.hp = Math.max(0, player.hp - enemyTemplate.damage);
      }
    }
  }
}

// ================= DRAW =================
function drawMenu() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("METRO DESCENT", canvas.width / 2, 260);

  ctx.fillStyle = "rgba(0,255,100,0.85)";
  ctx.fillRect(450, 360, 300, 60);

  ctx.fillStyle = "black";
  ctx.font = "28px Arial";
  ctx.fillText("START GAME", canvas.width / 2, 402);

  ctx.textAlign = "left";
}

function drawHud() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(16, 16, 260, 52);

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(`HP: ${player.hp}`, 28, 48);
}

function drawGame() {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // ✅ خط زمین بازی رو نامرئی کردیم: هیچ stroke/fill برای پلی‌گان نداریم

  // برای اینکه عمق درست حس بشه: بر اساس y مرتب‌سازی (دورتر اول، نزدیک‌تر آخر)
  const drawables = [];

  // enemies
  for (const e of enemies) {
    drawables.push({ type: "enemy", y: e.y, ref: e });
  }
  // player
  drawables.push({ type: "player", y: player.y, ref: player });

  drawables.sort((a, b) => a.y - b.y);

  for (const d of drawables) {
    if (d.type === "enemy") {
      const e = d.ref;
      const r = enemyRadius(e);

      ctx.fillStyle = "rgba(255, 200, 0, 0.95)";
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const r = playerRadius();

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHud();
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "menu") {
    drawMenu();
  } else {
    maintainEnemies();
    updatePlayer();
    updateEnemies();
    drawGame();
  }

  requestAnimationFrame(loop);
}

loop();
