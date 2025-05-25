const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  let userId = null;

  socket.on('join', uid => {
    userId = uid;
    socket.join('global');
    // Notify others of null->initial
    io.to('global').emit('presence', { userId, nodeId: null });
  });

  socket.on('presence', ({ userId: uid, nodeId }) => {
    io.to('global').emit('presence', { userId: uid, nodeId });
  });

  socket.on('disconnect', () => {
    if (userId) io.to('global').emit('presence', { userId, nodeId: null });
  });
});

// Fallback: serve index.html for any other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Collaboration server listening on port ${PORT}`)); 