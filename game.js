const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ===== Background =====
const bg = new Image();
bg.src = "assets/images/metro-bg.PNG?v=" + Date.now();

// ===== Player =====
const player = {
  x: canvas.width * 0.5,
  y: canvas.height * 0.75,
  r: 18,
  speed: 4
};

// ===== Polygon Walk Zone (FIXED) =====
const walkPoly = [
  { x: canvas.width * 0.18, y: canvas.height * 0.94 },
  { x: canvas.width * 0.42, y: canvas.height * 0.36 },
  { x: canvas.width * 0.58, y: canvas.height * 0.36 },
  { x: canvas.width * 0.82, y: canvas.height * 0.94 }
];

// ===== Input =====
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== Geometry =====
function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;

    const intersect =
      ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 1e-9) + xi);

    if (intersect) inside = !inside;
  }
  return inside;
}

function circleInsidePoly(cx, cy, r, poly) {
  const samples = 12;
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (!pointInPoly({ x: px, y: py }, poly)) return false;
  }
  return pointInPoly({ x: cx, y: cy }, poly);
}

// ===== Game Loop =====
function update() {
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
}

function drawPoly(poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Debug (بعداً می‌تونی حذفش کنی)
  drawPoly(walkPoly);
  ctx.strokeStyle = "rgba(0,255,0,0.25)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Player
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
