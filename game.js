const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ================= GAME STATE =================
let gameState = "menu"; // menu | play

// ================= BACKGROUND =================
const bg = new Image();
bg.src = "assets/images/metro-bg.PNG?v=" + Date.now();

// ================= WALK POLYGON =================
const walkPoly = [
  { x: canvas.width * 0.0050, y: canvas.height * 0.9136 },
  { x: canvas.width * 0.4557, y: canvas.height * 0.5097 },
  { x: canvas.width * 0.5050, y: canvas.height * 0.5127 },
  { x: canvas.width * 0.9958, y: canvas.height * 0.9136 }
];

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

function circleInsidePoly(x, y, r, poly) {
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (!pointInPoly({ x: px, y: py }, poly)) return false;
  }
  return true;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ================= PLAYER =================
const player = {
  x: canvas.width * 0.5,
  y: canvas.height * 0.8,
  r: 18,
  speed: 3.5,
  hp: 100,
  target: null
};

// ================= INPUT =================
canvas.addEventListener("click", (e) => {
  if (gameState !== "play") return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  if (circleInsidePoly(x, y, player.r, walkPoly)) {
    player.target = { x, y };
  }
});

const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ================= MENU CLICK =================
canvas.addEventListener("mousedown", (e) => {
  if (gameState !== "menu") return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  if (x > 450 && x < 750 && y > 360 && y < 420) {
    gameState = "play";
  }
});

// ================= UPDATE =================
function updatePlayer() {
  if (!player.target) return;

  const d = dist(player, player.target);
  if (d < 4) {
    player.target = null;
    return;
  }

  const dx = (player.target.x - player.x) / d;
  const dy = (player.target.y - player.y) / d;

  const nx = player.x + dx * player.speed;
  const ny = player.y + dy * player.speed;

  if (circleInsidePoly(nx, ny, player.r, walkPoly)) {
    player.x = nx;
    player.y = ny;
  } else {
    player.target = null;
  }
}

// ================= DRAW =================
function drawPoly() {
  ctx.beginPath();
  ctx.moveTo(walkPoly[0].x, walkPoly[0].y);
  walkPoly.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
}

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
}

function drawGame() {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  drawPoly();
  ctx.strokeStyle = "rgba(0,255,0,0.18)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Player
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "menu") {
    drawMenu();
  } else {
    updatePlayer();
    drawGame();
  }

  requestAnimationFrame(loop);
}

loop();
