const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ========= BACKGROUND =========
const bg = new Image();
bg.src = "assets/images/metro-bg.PNG?v=" + Date.now();

// ========= PLAYER =========
const player = {
  x: canvas.width * 0.5,
  y: canvas.height * 0.80,
  r: 18,
  speed: 4
};

// ========= WALK POLYGON (FINAL) =========
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
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (!pointInPoly({ x: px, y: py }, poly)) return false;
  }
  return true;
}

// ========= GAME LOOP =========
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

  // Debug (بعداً اگر خواستی پاکش می‌کنیم)
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
