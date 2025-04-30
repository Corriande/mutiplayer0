const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

const GRAVITY = 0.7;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const GROUND_Y = 300;
const PLAYER_RADIUS = 15;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PLAYER_SPACING = 100;

let players = {};
let playerCount = 0;

const platforms = [
  { x: 150, y: 220, w: 120, h: 10 },
  { x: 350, y: 160, w: 120, h: 10 },
];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);
  const myIndex = playerCount++;
  const color = getRandomColor();

  players[socket.id] = {
    x: 100 + myIndex * PLAYER_SPACING,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    moveLeft: false,
    moveRight: false,
    jumping: false,
    color,
    swinging: false,
    swordAngle: 270,
    hitCooldown: 0,
    facing: 1,
  };

  socket.on('jump', () => {
    const p = players[socket.id];
    if (p && !p.jumping) {
      p.vy = JUMP_FORCE;
      p.jumping = true;
    }
  });

  socket.on('move', (data) => {
    const p = players[socket.id];
    if (p) {
      p.moveLeft = data.left;
      p.moveRight = data.right;
      if (data.left) p.facing = -1;
      if (data.right) p.facing = 1;
    }
  });

  socket.on('swing', () => {
    const p = players[socket.id];
    if (p && !p.swinging) {
      p.swinging = true;
      p.swordAngle = 270;
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
    delete players[socket.id];
  });
});

function getRandomColor() {
  const r = Math.floor(Math.random() * 200 + 30);
  const g = Math.floor(Math.random() * 200 + 30);
  const b = Math.floor(Math.random() * 200 + 30);
  return `rgb(${r},${g},${b})`;
}

setInterval(() => {
  for (let id in players) {
    const p = players[id];

    if (p.moveLeft) p.x -= MOVE_SPEED;
    if (p.moveRight) p.x += MOVE_SPEED;

    p.vy += GRAVITY;
    p.y += p.vy;

    if (p.y >= GROUND_Y) {
      p.y = GROUND_Y;
      if (p.vy > 0) p.vy *= -0.4;
      if (Math.abs(p.vy) < 1) {
        p.vy = 0;
        p.jumping = false;
      }
    }

    if (p.x < PLAYER_RADIUS || p.x > CANVAS_WIDTH - PLAYER_RADIUS) {
      p.vx *= -0.6;
      if (p.x < PLAYER_RADIUS) p.x = PLAYER_RADIUS;
      if (p.x > CANVAS_WIDTH - PLAYER_RADIUS) p.x = CANVAS_WIDTH - PLAYER_RADIUS;
    }

    p.x += p.vx || 0;
    p.vx *= 0.9;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;

    if (p.swinging) {
      if (p.facing === 1) {
        p.swordAngle += 15;
        if (p.swordAngle >= 450) {
          p.swinging = false;
          p.swordAngle = 270;
        }
      } else {
        p.swordAngle -= 15;
        if (p.swordAngle <= 90) {
          p.swinging = false;
          p.swordAngle = 270;
        }
      }
    }

    if (p.hitCooldown > 0) p.hitCooldown--;

    for (let plat of platforms) {
      if (
        p.x > plat.x - plat.w / 2 &&
        p.x < plat.x + plat.w / 2 &&
        p.y + PLAYER_RADIUS >= plat.y &&
        p.y + PLAYER_RADIUS <= plat.y + plat.h &&
        p.vy > 0
      ) {
        p.y = plat.y - PLAYER_RADIUS;
        p.vy = 0;
        p.jumping = false;
      }
    }
  }

  // Sword hits
  for (let aid in players) {
    const attacker = players[aid];
    if (!attacker.swinging) continue;

    const swordLen = 30;
    const swordRad = (attacker.swordAngle * Math.PI) / 180;
    const sx = attacker.x + Math.cos(swordRad) * swordLen;
    const sy = attacker.y + Math.sin(swordRad) * swordLen;

    for (let tid in players) {
      if (tid === aid) continue;
      const target = players[tid];
      const dx = target.x - sx;
      const dy = target.y - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PLAYER_RADIUS * 2 && target.hitCooldown <= 0) {
        const angle = attacker.facing === 1 ? 0 : Math.PI;
        target.vx = Math.cos(angle) * 10;
        target.vy = -5;
        target.hitCooldown = 30;
      }
    }
  }

  io.emit("state", { players, platforms });
}, 1000 / 30);

http.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
