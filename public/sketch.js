let socket;
let circle = { x: 200, y: 200 };

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

  let prevX = -1, prevY = -1;

  function draw() {
    if (mouseX !== prevX || mouseY !== prevY) {
      if (millis() - lastSend > 33) {
        socket.emit('move', { x: mouseX, y: mouseY });
        lastSend = millis();
        prevX = mouseX;
        prevY = mouseY;
      }
    }

  background(240);
  ellipse(circle.x, circle.y, 50, 50);
}


  fill(50, 100, 255);
  noStroke();
  ellipse(circle.x, circle.y, 50, 50);
}

function mouseMoved() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    circle.x = mouseX;
    circle.y = mouseY;
  }
}


