const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();

const normalizeUrl = (url) => url ? url.replace(/\/$/, "") : "";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000"
].map(normalizeUrl);

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(",").map(url => normalizeUrl(url.trim()));
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeUrl(origin);
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── raste ──────────────────────────────────────────────
const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
const messageRoutes      = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const earningRoutes      = require("./routes/earningRoutes");
const paymentRoutes      = require("./routes/paymentRoutes");
const taskRoutes         = require("./routes/taskRoutes");
const trainingRoutes     = require("./routes/trainingRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const aiRoutes           = require("./routes/aiRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");

app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/earnings",      earningRoutes);
app.use("/api/payment",       paymentRoutes);
app.use("/api/tasks",         taskRoutes);
app.use("/api/trainings",     trainingRoutes);
app.use("/api/verify",        verificationRoutes);
app.use("/api/ai",            aiRoutes);
app.use("/api/reviews",       reviewRoutes);

// ─── health check ───────────────────────────────────
app.get("/", (req, res) => res.json({ status: "✅ DevTrust API running" }));

// ─── socket.io ───────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeUrl(origin);
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

// online users rakho: { userId: socketId }
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // user ko online dikhao
  socket.on("userOnline", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("onlineUsers", onlineUsers);
  });

  // apne room me aao
  socket.on("join", (userId) => {
    socket.join(userId.toString());
  });

  // message bhejo
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    io.to(receiverId.toString()).emit("receiveMessage", { senderId, message });
  });

  // typing dikhao
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("typing", senderId);
  });

  // message padh liya
  socket.on("seenMessage", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("messageSeen");
  });

  // ─── webrtc video call ──────────────────────────────────
  socket.on("call-user", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall.toString()).emit("call-made", { signal: signalData, from, name });
  });

  socket.on("answer-call", (data) => {
    io.to(data.to.toString()).emit("call-answered", data.signal);
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to.toString()).emit("ice-candidate", candidate);
  });

  socket.on("end-call", ({ to }) => {
    io.to(to.toString()).emit("call-ended");
  });

  // disconnect
  socket.on("disconnect", () => {
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }
    io.emit("onlineUsers", onlineUsers);
    console.log("❌ Disconnected:", socket.id);
  });
});

// ─── shuru ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🔥 DevTrust server running at http://localhost:${PORT}`);
});