const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const driver = require('./db');

const app = express();
// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// REST API setup
app.use(express.json());
const { createUser, getUser, deleteAll } = require('./services/userService');
const { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriends, getPendingRequests } = require('./services/friendService');

// User endpoints
app.post('/api/users', async (req, res) => {
  try {
    const { id, name } = req.body;
    const user = await createUser(id, name);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Friendship endpoints
app.post('/api/friend-request', async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    await sendFriendRequest(fromId, toId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friend-accept', async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    await acceptFriendRequest(fromId, toId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friend-decline', async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    await declineFriendRequest(fromId, toId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/friends', async (req, res) => {
  try {
    const list = await getFriends(req.params.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/requests', async (req, res) => {
  try {
    const list = await getPendingRequests(req.params.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Close Neo4j driver on process exit
process.on('SIGINT', async () => {
  await driver.close();
  process.exit();
}); 