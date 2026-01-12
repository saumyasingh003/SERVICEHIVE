import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "../src/config/db.js";

// Route imports
import authRoutes from "../src/routes/authRoutes.js";
import gigRoutes from "../src/routes/gigRoutes.js";
import bidRoutes from "../src/routes/bidRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store connected users with their socket IDs
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New socket connection:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`✅ User ${userId} joined with socket ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible in routes
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// CORS configuration for HttpOnly cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Health check route
app.get("/", (_, res) => {
  res.json({
    ok: true,
    name: "ServiceHive API",
    version: "1.0.0",
    features: ["MongoDB Transactions", "Socket.io Real-time"],
    endpoints: {
      auth: "/auth",
      gigs: "/gigs",
      bids: "/bids",
    },
  });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/gigs", gigRoutes);
app.use("/bids", bidRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();
//     httpServer.listen(PORT, () =>
//       console.log(`✅ ServiceHive API running at: ${PORT}`)
//     );
//   } catch (err) {
//     console.error("❌ Failed to connect to DB", err);
//     process.exit(1);
//   }
// };

// startServer();

export { io };
