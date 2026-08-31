require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');

const { initDb } = require('./db');
const { attachSocket } = require('./socket');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);

// Serve the built React app (created by `npm run build` in /frontend,
// which runs automatically via the root package.json's postinstall script).
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Anything that isn't an API route falls through to the React app,
// so client-side routing (e.g. /chat) works on a hard refresh too.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }

  attachSocket(server, corsOrigin);

  server.listen(PORT, () => {
    console.log(`Ahsan.Dev Chat server running on port ${PORT}`);
  });
}

start();
