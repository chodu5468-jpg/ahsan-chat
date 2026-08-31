const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { generateToken } = require('../utils/token');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// A small set of accent colors handed out to new users for their
// initials avatar, so we never rely on stock photos.
const AVATAR_COLORS = ['#1F5F4D', '#D9A441', '#A63A50', '#4F8B76', '#C98A2C', '#2F5D50'];

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarColor: row.avatar_color,
    createdAt: row.created_at
  };
}

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are all required.' });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters: letters, numbers and underscores only.'
      });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar_color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_color, created_at`,
      [username.trim(), email.trim().toLowerCase(), passwordHash, avatarColor]
    );

    const user = publicUser(result.rows[0]);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint && err.constraint.includes('email') ? 'email' : 'username';
      return res.status(409).json({ error: `That ${field} is already taken.` });
    }
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong creating your account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      `SELECT id, username, email, password_hash, avatar_color, created_at
       FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const user = publicUser(row);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong logging you in.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, avatar_color, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Something went wrong loading your profile.' });
  }
});

module.exports = router;
