function startGame(mode) {
  console.log("Game started with: " + mode);

  // پاک کردن صفحه و شروع تونل
  document.body.innerHTML = `
    <canvas id="scene" width="800" height="600"></canvas>
  `;

  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");

  // پس‌زمینه سیاه تونل
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,800,600);

  // متن شروع تونل
  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.fillText("توی تاریکی مترو قدم می‌زنی...", 200, 300);
}
