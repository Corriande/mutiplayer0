let socket;
let gameState = { players: {}, platforms: [] };
let left = false, right = false;

function setup() {
  createCanvas(600, 400);
  socket = io();
  socket.on("state", data => (gameState = data));
}

function draw() {
  background(220);

  // Platforms
  for (const plat of gameState.platforms) {
    fill(100);
    rectMode(CENTER);
    rect(plat.x, plat.y, plat.w, plat.h);
  }

  // Players + swords
  for (const id in gameState.players) {
    const p = gameState.players[id];
    fill(p.color);
    ellipse(p.x, p.y, 30, 30);

    if (p.swinging) {
      const angle = radians(p.swordAngle);
      const sx = p.x + cos(angle) * 30;
      const sy = p.y + sin(angle) * 30;
      stroke(0);
      strokeWeight(4);
      line(p.x, p.y, sx, sy);
      noStroke();
    }
  }

  stroke(0);
  line(0, 315, width, 315);
}

function keyPressed() {
  if (key === "w") socket.emit("jump");
  if (key === "a") { left = true; sendMove(); }
  if (key === "d") { right = true; sendMove(); }
  if (key === " ") socket.emit("swing");
}

function keyReleased() {
  if (key === "a") { left = false; sendMove(); }
  if (key === "d") { right = false; sendMove(); }
}

function sendMove() {
  socket.emit("move", { left, right });
}
