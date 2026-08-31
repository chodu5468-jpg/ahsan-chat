const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

// A small palette of avatar colors handed out round-robin at signup,
// so every friend gets a distinct initial-avatar color.
const AVATAR_COLORS = ["#E3A857", "#4B6355", "#B65C43", "#6E8A7C", "#C98A3D"];

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarColor: row.avatar_color,
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are all required." });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: "Username must be between 3 and 30 characters." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email.toLowerCase(), username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "That username or email is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar_color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_color`,
      [username, email.toLowerCase(), passwordHash, color]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[auth/signup]", err);
    res.status(500).json({ error: "Something went wrong creating your account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Enter your email/username and password." });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1",
      [emailOrUsername.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "No account matches those details." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Something went wrong logging you in." });
  }
});

module.exports = router;
