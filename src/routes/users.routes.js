const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Everyone in the system is listed as a potential contact - simple by design,
// since this is meant for a small circle of friends rather than public discovery.
router.get("/", requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let result;

    if (search && search.trim()) {
      result = await pool.query(
        `SELECT id, username, avatar_color FROM users
         WHERE id != $1 AND username ILIKE $2
         ORDER BY username ASC`,
        [req.user.id, `%${search.trim()}%`]
      );
    } else {
      result = await pool.query(
        `SELECT id, username, avatar_color FROM users
         WHERE id != $1
         ORDER BY username ASC`,
        [req.user.id]
      );
    }

    res.json({
      users: result.rows.map((r) => ({
        id: r.id,
        username: r.username,
        avatarColor: r.avatar_color,
      })),
    });
  } catch (err) {
    console.error("[users]", err);
    res.status(500).json({ error: "Could not load contacts." });
  }
});

module.exports = router;
