require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { runMigrations } = require("./src/db");
const authRoutes = require("./src/routes/auth.routes");
const usersRoutes = require("./src/routes/users.routes");
const messagesRoutes = require("./src/routes/messages.routes");
const { attachSocket } = require("./src/socket");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messagesRoutes);

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});
attachSocket(io);

const PORT = process.env.PORT || 5000;

runMigrations()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[server] Ahsan.Dev chat API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] Failed to run migrations, exiting.", err);
    process.exit(1);
  });
