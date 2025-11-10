import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken"; // ✅ use directly here
import registerTaskHandlers from "../modules/task/socket-handler";

let io: Server;

// ✅ Socket Initialization
export default async function initializeSocket(server: http.Server) {
  try {
    io = new Server(server, {
      cors: {
        origin: [
          "https://frontend-isaq.onrender.com",
          "http://localhost:5173",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key"; // 👈 fallback for dev

    // 🔒 Inline socket authentication
    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          console.log("❌ No token provided for socket connection");
          return next(new Error("Unauthorized"));
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        // Store user data on socket for later use
        socket.data.user = {
          id: decoded._id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };

        next();
      } catch (err: any) {
        console.error("❌ Socket Auth Error:", err.message);
        next(new Error("Unauthorized"));
      }
    });

    // 🧩 When a client connects
    io.on("connection", (socket) => {
      console.log(`⚡ User connected: ${socket.data.user?.email || "unknown"} (${socket.id})`);

      // Register all real-time handlers (tasks, projects, teams, etc.)
      registerTaskHandlers(io, socket);

      socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.data.user?.email || "unknown"}`);
      });
    });

    console.log("✅ Socket.IO initialized for real-time task management");
    return io;
  } catch (err) {
    console.error("❌ Socket initialization failed:", err);
    throw err;
  }
}

// ✅ Export instance getter
export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized!");
  return io;
};
