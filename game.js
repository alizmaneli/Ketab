const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* رزولوشن واقعی بازی (با CSS فرق داره) */
canvas.width = 1200;
canvas.height = 675;

/* بک‌گراند */
const bg = new Image();
bg.src = "assets/metro-bg.jpg.PNG"; // دقیقا همون اسم فایل تو

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

function clampToWalkZone(x, y) {
  const left = walkZone.x;
  const right = walkZone.x + walkZone.width;
  const top = walkZone.y;
  const bottom = walkZone.y + walkZone.height;

  return (
    x > left + player.r &&
    x < right - player.r &&
    y > top + player.r &&
    y < bottom - player.r
  );
}

function update() {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= player.speed;
  if (keys["s"]) ny += player.speed;
  if (keys["a"]) nx -= player.speed;
  if (keys["d"]) nx += player.speed;

  /* فقط داخل مسیر وسط اجازه حرکت بده */
  if (clampToWalkZone(nx, ny)) {
    player.x = nx;
    player.y = ny;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* بک‌گراند */
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  /* دیباگ ناحیه راه رفتن (اگر خواستی بعداً خاموشش می‌کنیم) */
  ctx.strokeStyle = "rgba(0,255,0,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(walkZone.x, walkZone.y, walkZone.width, walkZone.height);

  /* پلیر */
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

/* شروع بازی بعد از لود شدن عکس */
bg.onload = () => loop();

/* اگر عکس لود نشد، خطا رو ببین */
bg.onerror = () => {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ERROR: Background image not found!", 30, 40);
  ctx.fillText("Check: assets/metro-bg.jpg.PNG", 30, 70);
};
