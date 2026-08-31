const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:userId
// Loads the full conversation between the logged-in user and :userId,
// oldest first, and marks any messages from that user as read.
router.get('/:userId', requireAuth, async (req, res) => {
  const otherId = Number(req.params.userId);
  if (!Number.isInteger(otherId)) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, content, is_read, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC
       LIMIT 500`,
      [req.user.id, otherId]
    );

    await pool.query(
      `UPDATE messages SET is_read = TRUE
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
      [otherId, req.user.id]
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at
    }));

    res.json({ messages });
  } catch (err) {
    console.error('Load messages error:', err);
    res.status(500).json({ error: 'Could not load this conversation.' });
  }
});

module.exports = router;
