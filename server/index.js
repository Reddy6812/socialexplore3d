const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Add user data persistence
const usersFile = path.join(__dirname, 'users.json');
let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
} catch {
  users = [];
}
// Serve users list
app.get('/api/users', (req, res) => {
  res.json(users);
});
// Create new user
app.post('/api/users', (req, res) => {
  const { email, password, label } = req.body;
  const id = Date.now().toString();
  const newUser = { id, email, password, label, showConnections: true, profileVisibility: 'public', isAdmin: false };
  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.status(201).json(newUser);
});

io.on('connection', socket => {
  let userId = null;

  socket.on('join', uid => {
    userId = uid;
    socket.join('global');
    // Notify others of null->initial
    io.to('global').emit('presence', { userId, nodeId: null });
  });

  // join chat-specific rooms for private chats
  socket.on('joinChat', chatId => {
    socket.join(chatId);
  });

  // relay WebRTC signaling data to other participants in the chat room
  socket.on('video-signal', data => {
    socket.broadcast.to(data.chatId).emit('video-signal', data);
  });

  socket.on('presence', ({ userId: uid, nodeId }) => {
    io.to('global').emit('presence', { userId: uid, nodeId });
  });

  socket.on('disconnect', () => {
    if (userId) io.to('global').emit('presence', { userId, nodeId: null });
  });

  // relay chat messages to chat-specific room
  socket.on('chatMessage', (msg) => {
    // broadcast to participants in the chat room except sender
    socket.broadcast.to(msg.chatId).emit('chatMessage', msg);
  });

  // relay message deletion events to chat-specific room
  socket.on('deleteMessage', ({ chatId, messageId }) => {
    socket.broadcast.to(chatId).emit('deleteMessage', { chatId, messageId });
  });

  // relay friend requests
  socket.on('friendRequest', (req) => {
    // broadcast to others in the room
    socket.broadcast.to('global').emit('friendRequest', req);
  });

  // relay friend removal events
  socket.on('friendRemove', (upd) => {
    socket.broadcast.to('global').emit('friendRemove', upd);
  });

  // broadcast video call start to other participants
  socket.on('start-call', ({ chatId, from }) => {
    socket.broadcast.to(chatId).emit('start-call', { chatId, from });
  });

  // broadcast video call end to other participants
  socket.on('end-call', ({ chatId }) => {
    socket.broadcast.to(chatId).emit('end-call', { chatId });
  });
});

// Fallback: serve index.html for any other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Collaboration server listening on port ${PORT}`)); 