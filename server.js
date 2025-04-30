const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let circlePos = { x: 200, y: 200 };

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  // Send the current position to the new client
  socket.emit('position', circlePos);

  // When a client moves the mouse
  socket.on('move', (data) => {
    circlePos = data;
    io.emit('position', circlePos); // Broadcast new position to everyone
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

http.listen(3000, () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`🌐 Server running at http://${net.address}:3000`);
      }
    }
  }
});
