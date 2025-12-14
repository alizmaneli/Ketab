const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ===== Background =====
const bg = new Image();
const BG_PATH = "assets/images/metro-bg.PNG";
bg.src = BG_PATH + "?v=" + Date.now();

// ===== UI (دکمه روی خود صفحه) =====
function makeButton() {
  const btn = document.createElement("button");
  btn.id = "toggleEdit";
  btn.textContent = "EDIT";
  Object.assign(btn.style, {
    position: "fixed",
    top: "16px",
    left: "16px",
    zIndex: 9999,
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #00ff66",
    background: "rgba(0,0,0,0.6)",
    color: "#00ff66",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "manipulation"
  });
  document.body.appendChild(btn);
  return btn;
}
const toggleBtn = makeButton();

// ===== Player =====
const player = {
  x: canvas.width * 0.50,
  y: canvas.height * 0.78,
  r: 18,
  speed: 4
};

// ===== Polygon Walk Zone =====
let walkPoly = [
  { x: canvas.width * 0.22, y: canvas.height * 0.95 }, // bottom-left
  { x: canvas.width * 0.44, y: canvas.height * 0.30 }, // top-left
  { x: canvas.width * 0.56, y: canvas.height * 0.30 }, // top-right
  { x: canvas.width * 0.78, y: canvas.height * 0.95 }  // bottom-right
];

// ===== Edit Mode (با دکمه) =====
let editMode = false;
toggleBtn.addEventListener("click", () => {
  editMode = !editMode;
  toggleBtn.textContent = editMode ? "PLAY" : "EDIT";
  toggleBtn.style.borderColor = editMode ? "#ff3b30" : "#00ff66";
  toggleBtn.style.color = editMode ? "#ff3b30" : "#00ff66";
});

// ===== Controls (WASD اگر کیبورد داشتی) =====
const keys = {};
addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

// ===== Geometry helpers =====
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

// ===== Touch/Mouse drag vertices =====
let draggingIndex = -1;

function getPointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function nearestVertexIndex(p, poly, maxDist = 34) {
  let best = -1;
  let bestD = maxDist;
  for (let i = 0; i < poly.length; i++) {
    const dx = poly[i].x - p.x;
    const dy = poly[i].y - p.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function pointerDown(evt) {
  if (!editMode) return;
  evt.preventDefault();
  const p = getPointerPos(evt);
  draggingIndex = nearestVertexIndex(p, walkPoly);
}

function pointerMove(evt) {
  if (!editMode) return;
  if (draggingIndex === -1) return;
  evt.preventDefault();
  const p = getPointerPos(evt);
  walkPoly[draggingIndex].x = p.x;
  walkPoly[draggingIndex].y = p.y;
}

function pointerUp(evt) {
  if (!editMode) return;
  evt.preventDefault();
  draggingIndex = -1;
}

canvas.addEventListener("mousedown", pointerDown);
canvas.addEventListener("mousemove", pointerMove);
addEventListener("mouseup", pointerUp);

canvas.addEventListener("touchstart", pointerDown, { passive: false });
canvas.addEventListener("touchmove", pointerMove, { passive: false });
addEventListener("touchend", pointerUp, { passive: false });

// ===== Render helpers =====
function drawPoly(poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
}

// ===== Game loop =====
function update() {
  if (editMode) return;

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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // BG
  if (bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Loading BG...", 30, 40);
    ctx.fillText("Path: " + BG_PATH, 30, 70);
  }

  // Walk polygon
  drawPoly(walkPoly);
  ctx.strokeStyle = "rgba(0,255,0,0.40)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(0,255,0,0.05)";
  ctx.fill();

  // Handles in edit mode
  if (editMode) {
    for (let i = 0; i < walkPoly.length; i++) {
      ctx.fillStyle = i === draggingIndex ? "rgba(255,0,0,0.95)" : "rgba(0,255,0,0.95)";
      ctx.beginPath();
      ctx.arc(walkPoly[i].x, walkPoly[i].y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText(String(i), walkPoly[i].x + 14, walkPoly[i].y - 14);
    }

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(20, 20, 520, 52);
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText("EDIT MODE: drag green points. Tap PLAY when done.", 35, 52);
  }

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
