const { Server } = require('socket.io');
const { pool } = require('./db');
const { verifyToken } = require('./utils/token');

// Tracks how many open sockets each user currently has, so we only
// announce "online"/"offline" on the first connect / last disconnect.
const onlineCounts = new Map();

function roomFor(userId) {
  return `user_${userId}`;
}

function attachSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin || true,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Missing token'));
      const payload = verifyToken(token);
      socket.user = { id: payload.id, username: payload.username };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(roomFor(userId));

    const previousCount = onlineCounts.get(userId) || 0;
    onlineCounts.set(userId, previousCount + 1);
    if (previousCount === 0) {
      socket.broadcast.emit('presence', { userId, online: true });
    }

    socket.on('send_message', async ({ receiverId, content }, ack) => {
      try {
        const trimmed = (content || '').trim();
        if (!trimmed || !Number.isInteger(receiverId)) {
          if (typeof ack === 'function') ack({ error: 'Message cannot be empty.' });
          return;
        }
        if (trimmed.length > 2000) {
          if (typeof ack === 'function') ack({ error: 'Message is too long.' });
          return;
        }

        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, sender_id, receiver_id, content, is_read, created_at`,
          [userId, receiverId, trimmed]
        );

        const row = result.rows[0];
        const message = {
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          content: row.content,
          isRead: row.is_read,
          createdAt: row.created_at
        };

        io.to(roomFor(receiverId)).emit('receive_message', message);
        io.to(roomFor(userId)).emit('receive_message', message);
        if (typeof ack === 'function') ack({ message });
      } catch (err) {
        console.error('send_message error:', err);
        if (typeof ack === 'function') ack({ error: 'Message could not be sent.' });
      }
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      if (!Number.isInteger(receiverId)) return;
      io.to(roomFor(receiverId)).emit('typing', {
        userId,
        isTyping: Boolean(isTyping)
      });
    });

    socket.on('disconnect', () => {
      const count = (onlineCounts.get(userId) || 1) - 1;
      if (count <= 0) {
        onlineCounts.delete(userId);
        socket.broadcast.emit('presence', { userId, online: false });
      } else {
        onlineCounts.set(userId, count);
      }
    });
  });

  return io;
}

module.exports = { attachSocket };
