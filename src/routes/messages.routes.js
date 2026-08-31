const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Full history between the logged-in user and :otherId, oldest first.
router.get("/:otherId", requireAuth, async (req, res) => {
  try {
    const otherId = parseInt(req.params.otherId, 10);
    if (Number.isNaN(otherId)) {
      return res.status(400).json({ error: "Invalid contact id." });
    }

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, content, created_at, is_read
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

    res.json({
      messages: result.rows.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        content: m.content,
        createdAt: m.created_at,
        isRead: m.is_read,
      })),
    });
  } catch (err) {
    console.error("[messages]", err);
    res.status(500).json({ error: "Could not load messages." });
  }
});

module.exports = router;
