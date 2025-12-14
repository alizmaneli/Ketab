const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

// ================= BACKGROUND =================
const bg = new Image();
const BG_PATH = "assets/images/metro-bg.PNG";
bg.src = BG_PATH + "?v=" + Date.now();

// ================= UI BUTTONS =================
function createBtn(text, left) {
  const b = document.createElement("button");
  b.textContent = text;
  Object.assign(b.style, {
    position: "fixed",
    top: "16px",
    left: left + "px",
    zIndex: 9999,
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #00ff66",
    background: "rgba(0,0,0,0.7)",
    color: "#00ff66",
    fontSize: "15px",
    cursor: "pointer"
  });
  document.body.appendChild(b);
  return b;
}

const btnEdit = createBtn("EDIT", 16);
const btnCopy = createBtn("COPY POINTS", 100);

let editMode = false;

btnEdit.onclick = () => {
  editMode = !editMode;
  btnEdit.textContent = editMode ? "PLAY" : "EDIT";
  btnEdit.style.color = editMode ? "#ff3b30" : "#00ff66";
  btnEdit.style.borderColor = editMode ? "#ff3b30" : "#00ff66";
};

btnCopy.onclick = () => {
  const txt = exportPoints();
  navigator.clipboard.writeText(txt);
  btnCopy.textContent = "COPIED ✔";
  setTimeout(() => (btnCopy.textContent = "COPY POINTS"), 1200);
};

// ================= PLAYER =================
const player = {
  x: canvas.width * 0.5,
  y: canvas.height * 0.75,
  r: 18,
  speed: 4
};

// ================= WALK POLYGON =================
let walkPoly = [
  { x: canvas.width * 0.2, y: canvas.height * 0.95 },
  { x: canvas.width * 0.42, y: canvas.height * 0.35 },
  { x: canvas.width * 0.58, y: canvas.height * 0.35 },
  { x: canvas.width * 0.8, y: canvas.height * 0.95 }
];

// ================= INPUT =================
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

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

// ================= DRAG POINTS =================
let dragIndex = -1;

function getPos(evt) {
  const r = canvas.getBoundingClientRect();
  const cx = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const cy = evt.touches ? evt.touches[0].clientY : evt.clientY;
  return {
    x: (cx - r.left) * (canvas.width / r.width),
    y: (cy - r.top) * (canvas.height / r.height)
  };
}

function nearestPoint(p) {
  let idx = -1, min = 35;
  walkPoly.forEach((pt, i) => {
    const d = Math.hypot(pt.x - p.x, pt.y - p.y);
    if (d < min) { min = d; idx = i; }
  });
  return idx;
}

canvas.addEventListener("touchstart", e => {
  if (!editMode) return;
  dragIndex = nearestPoint(getPos(e));
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (!editMode || dragIndex === -1) return;
  const p = getPos(e);
  walkPoly[dragIndex].x = p.x;
  walkPoly[dragIndex].y = p.y;
}, { passive: false });

canvas.addEventListener("touchend", () => dragIndex = -1);

// ================= EXPORT =================
function exportPoints() {
  return `const walkPoly = [
${walkPoly.map(p =>
`  { x: canvas.width * ${(p.x / canvas.width).toFixed(4)}, y: canvas.height * ${(p.y / canvas.height).toFixed(4)} }`
).join(",\n")}
];`;
}

// ================= DRAW =================
function drawPoly() {
  ctx.beginPath();
  ctx.moveTo(walkPoly[0].x, walkPoly[0].y);
  walkPoly.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
}

function update() {
  if (editMode) return;
  let nx = player.x, ny = player.y;
  if (keys.w) ny -= player.speed;
  if (keys.s) ny += player.speed;
  if (keys.a) nx -= player.speed;
  if (keys.d) nx += player.speed;
  if (circleInsidePoly(nx, ny, player.r, walkPoly)) {
    player.x = nx; player.y = ny;
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bg,0,0,canvas.width,canvas.height);

  drawPoly();
  ctx.strokeStyle = "rgba(0,255,0,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();

  walkPoly.forEach((p,i)=>{
    ctx.fillStyle="lime";
    ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="white";
    ctx.fillText(i,p.x+12,p.y-12);
  });

  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
  ctx.fill();
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
