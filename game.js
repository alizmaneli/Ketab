const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 675;

/* بک‌گراند */
const bg = new Image();
bg.src = "assets/images/metro-bg.PNG?v=" + Date.now(); // دقیقا همون اسم فایل تو

/* ناحیه قابل راه رفتن (وسط) */
const walkZone = {
  x: canvas.width * 0.30,
  y: canvas.height * 0.15,
  width: canvas.width * 0.40,
  height: canvas.height * 0.75
};

/* پلیر تستی */
const player = {
  x: canvas.width / 2,
  y: canvas.height * 0.7,
  r: 18,
  speed: 4
};

const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function insideWalkZone(x, y) {
  const left = walkZone.x + player.r;
  const right = walkZone.x + walkZone.width - player.r;
  const top = walkZone.y + player.r;
  const bottom = walkZone.y + walkZone.height - player.r;

  return x > left && x < right && y > top && y < bottom;
}

function update() {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= player.speed;
  if (keys["s"]) ny += player.speed;
  if (keys["a"]) nx -= player.speed;
  if (keys["d"]) nx += player.speed;

  if (insideWalkZone(nx, ny)) {
    player.x = nx;
    player.y = ny;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // بک‌گراند
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // خط سبز = محدوده راه رفتن (برای تست)
  ctx.strokeStyle = "rgba(0,255,0,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(walkZone.x, walkZone.y, walkZone.width, walkZone.height);

  // پلیر
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

bg.onload = () => loop();

bg.onerror = () => {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ERROR: Background image not found!", 30, 40);
  ctx.fillText("Check: assets/metro-bg.PNG", 30, 70);
};
