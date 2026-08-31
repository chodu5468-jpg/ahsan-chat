const jwt = require("jsonwebtoken");
const { pool } = require("./db");

// Tracks which socket belongs to which user id, so we can push a message
// straight to a friend's open tab the moment it's sent.
const onlineUsers = new Map(); // userId -> Set of socket ids

function attachSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided."));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      socket.username = payload.username;
      next();
    } catch (err) {
      next(new Error("Invalid or expired session."));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit("presence:update", { userId, online: true });

    socket.on("message:send", async ({ receiverId, content }, ack) => {
      try {
        const trimmed = (content || "").trim();
        if (!trimmed || !receiverId) {
          if (ack) ack({ error: "Message needs content and a recipient." });
          return;
        }

        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, sender_id, receiver_id, content, created_at, is_read`,
          [userId, receiverId, trimmed]
        );
        const saved = result.rows[0];

        const payload = {
          id: saved.id,
          senderId: saved.sender_id,
          receiverId: saved.receiver_id,
          content: saved.content,
          createdAt: saved.created_at,
          isRead: saved.is_read,
        };

        // Deliver to every open tab/device of both the sender and receiver.
        const targets = new Set([
          ...(onlineUsers.get(receiverId) || []),
          ...(onlineUsers.get(userId) || []),
        ]);
        targets.forEach((socketId) => io.to(socketId).emit("message:new", payload));

        if (ack) ack({ message: payload });
      } catch (err) {
        console.error("[socket message:send]", err);
        if (ack) ack({ error: "Message failed to send." });
      }
    });

    socket.on("typing", ({ receiverId, isTyping }) => {
      const targets = onlineUsers.get(receiverId) || new Set();
      targets.forEach((socketId) =>
        io.to(socketId).emit("typing", { userId, isTyping: !!isTyping })
      );
    });

    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:update", { userId, online: false });
        }
      }
    });
  });
}

module.exports = { attachSocket };
