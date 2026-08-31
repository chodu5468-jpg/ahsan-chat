# Ahsan.Dev Chat

A private, real-time messaging app for you and your friends — sign up, add
each other, and chat. Built with React (Vite) on the frontend, Express +
Socket.IO on the backend, and PostgreSQL for storage.

- 2 pages: a combined **Sign up / Log in** page, and the **Chat** page.
- Real-time messaging over WebSockets (Socket.IO), with typing indicators
  and online/offline presence.
- Light theme, dark theme, custom accent color, and custom background
  color — all saved in the browser.
- Responsive layout: works in any mobile or desktop browser (Android,
  iOS, Windows, macOS, Linux) — it's a web app, so there's nothing to
  install on the phone beyond opening the site (and it works fine "added
  to home screen" too).
- One repo, one deploy. No Tailwind, no ORM, no build magic — plain CSS
  and plain SQL so it's easy to read on GitHub and easy to deploy on
  Railway.

## How it's put together

```
ahsan-chat/
├── backend/          Express API + Socket.IO + PostgreSQL
│   ├── server.js      entry point
│   ├── db.js           connection pool + auto-creates tables on boot
│   ├── routes/          /api/auth, /api/users, /api/messages
│   ├── middleware/       JWT auth guard
│   └── socket.js          real-time messaging, typing, presence
├── frontend/         React app (Vite)
│   └── src/
│       ├── pages/          AuthPage.jsx, ChatPage.jsx
│       ├── components/      Sidebar, ConversationView, ThemeSwitcher, Logo…
│       ├── context/          Auth, Theme, Socket
│       └── styles/            plain CSS, no framework
└── package.json      root scripts that build the frontend and start the backend
```

In production the Express server serves the built React app directly, so
the whole thing runs as **one service** — simple to reason about and
simple to host.

## Local development

You'll need Node.js 18+ and a PostgreSQL database (local install, or a
free one from [Neon](https://neon.tech) or [Railway](https://railway.app)).

1. **Install dependencies**
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Configure the backend**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` and set `DATABASE_URL` to your Postgres connection
   string, and `JWT_SECRET` to any long random string (e.g. output of
   `openssl rand -hex 32`).

3. **Run both halves in two terminals**
   ```bash
   # Terminal 1
   npm run dev:backend

   # Terminal 2
   npm run dev:frontend
   ```
   Open **http://localhost:5173** — the frontend dev server proxies API
   and WebSocket calls to the backend on port 5000. Tables are created
   automatically the first time the backend starts.

## Deploying to Railway

1. Push this project to a GitHub repo.
2. On [railway.app](https://railway.app), create a **New Project** →
   **Deploy from GitHub repo** and pick this repo.
3. Click **+ New** → **Database** → **Add PostgreSQL**. Railway sets the
   `DATABASE_URL` variable on that database automatically.
4. On your app service, open **Variables** and add:
   - `DATABASE_URL` — reference the Postgres plugin's `DATABASE_URL`
     (Railway lets you pick it from a dropdown, or use `${{Postgres.DATABASE_URL}}`)
   - `JWT_SECRET` — any long random string
   - `NODE_ENV` — `production`
5. Deploy. Railway detects Node from `package.json`, runs `npm install`
   (which triggers `postinstall`, building the frontend and installing
   both `backend/` and `frontend/`), then runs `npm start`, which boots
   the Express server on the port Railway assigns.
6. Once it's live, open the Railway-provided URL — you'll land on the
   sign up page. Create an account, share the link with a friend, and
   start chatting.

No manual database migration step is needed — `backend/db.js` runs
`CREATE TABLE IF NOT EXISTS` on every boot, so a fresh database sets
itself up on first deploy.

## Design notes

- Type: **Fraunces** (display/headings/logo) paired with **Sora**
  (body/UI), both via Google Fonts.
- Palette: paper `#F1EEE6` / ink `#12140F` neutrals, pine green
  `#1F5F4D` (`#4FA98A` in dark mode) as the one signature accent, gold
  `#D9A441` used sparingly for attention (unread badges, focus states).
- No stock photography and no emoji icons — the logo mark and every
  small icon (theme toggle, send, back) is hand-drawn SVG. Avatars are
  colored initials.
- Layout is intentionally asymmetric: the sign-up/login screen is a
  58/42 split, not a centered card; the chat screen is sidebar + a wide
  conversation pane, with sent/received messages distinguished by
  alignment rather than identical bubble cards.

## Adding features later

Ideas that fit naturally into this structure if you want to extend it:
- Group chats (would need a `conversations` + `conversation_members` table)
- Message editing/deleting
- Image attachments (would need file storage, e.g. an S3-compatible bucket)
- Push notifications for mobile
