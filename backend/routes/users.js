const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users?search=foo
// Returns every other user, optionally filtered by username, plus the
// unread message count and most recent message for each so the sidebar
// can sort conversations by recent activity.
router.get('/', requireAuth, async (req, res) => {
  try {
    const search = (req.query.search || '').trim();

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.avatar_color,
        COUNT(m.id) FILTER (WHERE m.receiver_id = $1 AND m.is_read = FALSE) AS unread_count,
        MAX(m.created_at) AS last_message_at
      FROM users u
      LEFT JOIN messages m
        ON (m.sender_id = u.id AND m.receiver_id = $1)
        OR (m.sender_id = $1 AND m.receiver_id = u.id)
      WHERE u.id != $1
        AND ($2 = '' OR u.username ILIKE '%' || $2 || '%')
      GROUP BY u.id, u.username, u.avatar_color
      ORDER BY last_message_at DESC NULLS LAST, u.username ASC
      `,
      [req.user.id, search]
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      avatarColor: row.avatar_color,
      unreadCount: Number(row.unread_count),
      lastMessageAt: row.last_message_at
    }));

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Could not load contacts.' });
  }
});

module.exports = router;
