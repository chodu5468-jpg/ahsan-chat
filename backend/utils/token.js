const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.warn(
    'Warning: JWT_SECRET is not set. Set it in your .env file (see .env.example).'
  );
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    SECRET || 'insecure_dev_secret',
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET || 'insecure_dev_secret');
}

module.exports = { generateToken, verifyToken };
