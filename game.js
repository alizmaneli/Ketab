const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ========= BACKGROUND =========
const bg = new Image();
bg.src = "assets/images/metro-bg.PNG?v=" + Date.now();

// ========= WALK POLYGON (FINAL FROM YOU) =========
const walkPoly = [
  { x: canvas.width * 0.0050, y: canvas.height * 0.9136 },
  { x: canvas.width * 0.4557, y: canvas.height * 0.5097 },
  { x: canvas.width * 0.5050, y: canvas.height * 0.5127 },
  { x: canvas.width * 0.9958, y: canvas.height * 0.9136 }
];

// ========= INPUT =========
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ========= GEOMETRY =========
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
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (!pointInPoly({ x: px, y: py }, poly)) return false;
  }
  return true;
}

function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// ========= PLAYER =========
const player = {
  x: canvas.width * 0.50,
  y: canvas.height * 0.80,
  r: 18,
  speed: 4,
  hp: 100,
  maxHp: 100
};

// ========= ENEMIES =========
const enemies = [];
const ENEMY_MAX = 3;
const enemyTemplate = {
  r: 18,
  speed: 2.1,
  hp: 40,
  damage: 8,
  attackRange: 38,     // فاصله برای ضربه
  attackCooldown: 700  // ms
};

// اسپاون نقطه داخل پلی‌گان با رندوم
function randomPointInWalkPoly() {
  // برای سرعت: از bounding box پلی‌گان استفاده می‌کنیم
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of walkPoly) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  // چند بار تلاش کن تا نقطه‌ای پیدا شه که داخل پلی‌گان باشه
  for (let i = 0; i < 400; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (circleInsidePoly(x, y, enemyTemplate.r, walkPoly)) return { x, y };
  }

  // fallback: وسط پلی‌گان (اگر خیلی بد شد)
  return { x: canvas.width * 0.5, y: canvas.height * 0.8 };
}

function spawnEnemy() {
  const p = randomPointInWalkPoly();
  enemies.push({
    x: p.x,
    y: p.y,
    r: enemyTemplate.r,
    speed: enemyTemplate.speed,
    hp: enemyTemplate.hp,
    maxHp: enemyTemplate.hp,
    lastHit: 0
  });
}

// پر کردن دشمن‌ها تا سقف
function maintainEnemies() {
  while (enemies.length < ENEMY_MAX) spawnEnemy();
}

// ========= OPTIONAL: simple "player hit" by SPACE =========
// اگر SPACE بزنی و دشمن نزدیک باشه، HP دشمن کم می‌شه (برای تست فایت)
let lastPlayerAttack = 0;
const PLAYER_DAMAGE = 15;
const PLAYER_RANGE = 55;
const PLAYER_COOLDOWN = 350;

// ========= UPDATE =========
function updatePlayer() {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= player.speed;
  if (keys["s"]) ny += player.speed;
  if (keys["a"]) nx -= player.speed;
  if (keys["d"]) nx += player.speed;

  if (circleInsidePoly(nx, ny, player.r, walkPoly)) {
    player.x = nx;
    player.y = ny;
  }

  // حمله تستی با Space
  const now = performance.now();
  if (keys[" "] && now - lastPlayerAttack > PLAYER_COOLDOWN) {
    lastPlayerAttack = now;

    // نزدیک‌ترین دشمن داخل رنج رو بزن
    let best = null;
    let bestD = Infinity;
    for (const e of enemies) {
      const d = dist(player.x, player.y, e.x, e.y);
      if (d < PLAYER_RANGE && d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (best) best.hp -= PLAYER_DAMAGE;
  }
}

function updateEnemies() {
  const now = performance.now();

  for (const e of enemies) {
    // حرکت به سمت پلیر
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;

    // اگر خیلی نزدیک شد، کمتر حرکت کن که نلرزه
    const step = e.speed * (d < 60 ? 0.6 : 1.0);

    const vx = (dx / d) * step;
    const vy = (dy / d) * step;

    const nx = e.x + vx;
    const ny = e.y + vy;

    // فقط اگر داخل پلی‌گان بود، حرکت کن
    if (circleInsidePoly(nx, ny, e.r, walkPoly)) {
      e.x = nx;
      e.y = ny;
    }

    // ضربه به پلیر اگر در رنج
    if (d < enemyTemplate.attackRange) {
      if (now - e.lastHit > enemyTemplate.attackCooldown) {
        e.lastHit = now;
        player.hp = Math.max(0, player.hp - enemyTemplate.damage);
      }
    }
  }

  // حذف دشمن‌های مرده
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) enemies.splice(i, 1);
  }
}

// ========= DRAW =========
function drawPoly(poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
}

function drawHud() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(16, 16, 320, 92);

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, 28, 44);
  ctx.fillText(`Enemies: ${enemies.length}`, 28, 72);

  // HP bar
  const w = 260, h = 10;
  const x = 28, y = 52;
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,60,60,0.90)";
  ctx.fillRect(x, y, w * (player.hp / player.maxHp), h);

  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(`SPACE = attack (test)`, 190, 72);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // BG
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Debug: walk zone
  drawPoly(walkPoly);
  ctx.strokeStyle = "rgba(0,255,0,0.18)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Enemies
  for (const e of enemies) {
    // body
    ctx.fillStyle = "rgba(255, 200, 0, 0.95)";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();

    // hp bar
    const bw = 42, bh = 6;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 16, bw, bh);
    ctx.fillStyle = "rgba(0,255,0,0.85)";
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 16, bw * (e.hp / e.maxHp), bh);
  }

  // Player
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // HUD
  drawHud();
}

// ========= LOOP =========
function loop() {
  maintainEnemies();
  updatePlayer();
  updateEnemies();
  draw();
  requestAnimationFrame(loop);
}
loop();
