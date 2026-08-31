# Ahsan.Dev — real-time chat for your friends

A small, private chat app: sign up, log in, and message the people in your
circle in real time. Built with React (Vite), Node.js/Express, Socket.io,
and PostgreSQL.

```
ahsan-chat/
├── backend/     Express API + Socket.io + PostgreSQL
└── frontend/    React (Vite) client
```

## Features

- Email/username + password auth (JWT, bcrypt-hashed passwords)
- Real-time 1:1 messaging via Socket.io, with typing indicators & online status
- Message history stored in PostgreSQL
- Light / dark theme toggle
- Custom chat background — pick a swatch or paste any image URL
- Responsive layout (phones, tablets, desktop — works in any modern browser
  on Android, iOS, Windows, macOS, Linux)

## 1. Local setup

### Requirements
- Node.js 18+
- A PostgreSQL database (local install, or a free one from Railway/Neon/Supabase)

### Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres connection string,
# and set JWT_SECRET to any long random string
npm install
npm run dev
```

The server runs on `http://localhost:5000` by default and creates its own
tables on boot (see `src/schema.sql`) — no manual migration step needed.

### Frontend

```bash
cd frontend
cp .env.example .env
# edit .env if your backend isn't on localhost:5000
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL, then open it again in a
second browser (or an incognito window) with a second account to test
messaging between two people.

## 2. Deploying to Railway (via GitHub)

Push this whole folder to a GitHub repo, then in Railway:

1. **New Project → Deploy from GitHub repo** — pick your repo.
2. **Add the database:** in the project, click **+ New → Database →
   PostgreSQL**. Railway creates it and exposes `DATABASE_URL`.
3. **Backend service:** click **+ New → GitHub Repo** (same repo again),
   then in that service's **Settings → Root Directory**, set it to
   `backend`. In **Variables**, add:
   - `DATABASE_URL` → click "Add Reference" and select the Postgres
     plugin's `DATABASE_URL` (so it's always in sync)
   - `JWT_SECRET` → a long random string
   - `CLIENT_ORIGIN` → your frontend's Railway URL once you have it
     (you can add this after step 4 and redeploy)
   - `NODE_ENV` → `production`

   Railway auto-detects `npm install` + `npm start` from `package.json`
   and assigns a public URL under **Settings → Networking → Generate
   Domain**.
4. **Frontend service:** click **+ New → GitHub Repo** once more, set
   **Root Directory** to `frontend`. In **Variables**, add:
   - `VITE_API_URL` → the backend service's public URL from step 3

   Set the **Build Command** to `npm run build` and the **Start Command**
   to `npm run preview`. Generate a public domain for this service too.
5. Go back to the **backend** service's variables and set `CLIENT_ORIGIN`
   to the frontend's public URL, then redeploy the backend so CORS allows it.

That's it — visit the frontend's Railway URL, create an account, and share
the link with your friends so they can sign up too.

## Design notes

- Typefaces: **Fraunces** (display/wordmark) paired with **Work Sans** (UI
  and body text), loaded from Google Fonts.
- Palette: warm amber (`#E3A857`) and moss green (`#4B6355`) accents over a
  deep green-black dark mode (`#1B211D`) or linen-paper light mode
  (`#F1EEE4`) — no purple/blue gradients.
- Avatars are colored initials, not stock photography.
- Icons are hand-drawn inline SVGs, not emoji.
