let socket;
let circle = { x: 200, y: 200 };
let lastSend = 0;
let prevX = -1, prevY = -1;

function setup() {
  createCanvas(400, 400);
  background(240);

  socket = io();

  socket.on('position', (pos) => {
    circle = pos;
  });
}

function draw() {
  background(240);

  fill(50, 100, 255);
  noStroke();
  ellipse(circle.x, circle.y, 50, 50);

  // Only send position if it changed and throttle to ~30fps
  if ((mouseX !== prevX || mouseY !== prevY) && millis() - lastSend > 33) {
    socket.emit('move', { x: mouseX, y: mouseY });
    lastSend = millis();
    prevX = mouseX;
    prevY = mouseY;
  }
}
