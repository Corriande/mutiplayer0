const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

let circlePos = { x: 200, y: 200 };

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve index.html at root (/) route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ WebSocket connection handling
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

// ✅ Start server with correct port for Render
http.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
