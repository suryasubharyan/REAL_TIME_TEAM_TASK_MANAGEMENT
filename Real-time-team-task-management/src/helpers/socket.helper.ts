// src/helpers/socket.helper.ts
import { Server } from "socket.io";
import http from "http";
import registerTaskHandlers from "../modules/task/socket-handler"; // update path if needed
import jwt from "jsonwebtoken";

let io: Server | null = null;
let initialized = false;

export default function initializeSocket(server: http.Server) {
  if (initialized && io) return io;

  io = new Server(server, {
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
    transports: ["polling", "websocket"], // polling first -> then upgrade
  });

  // Optional auth middleware: read token from handshake.auth.token
  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) || null;
      if (!token) {
        // allow anonymous (or you can reject): next(new Error("Unauthorized"));
        socket.data.user = null;
        return next();
      }
      const secret = process.env.JWT_SECRET || "changeme";
      const decoded: any = jwt.verify(token, secret);
      socket.data.user = {
        _id: decoded._id || decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
      next();
    } catch (err) {
      console.warn("Socket auth failed:", err);
      // reject or allow: we allow but mark unauthenticated
      socket.data.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id, "user:", socket.data?.user?.email || "anon");

    // Register your handlers (task, activity, rooms, etc.)
    registerTaskHandlers(io!, socket);

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", socket.id, reason);
    });
  });

  initialized = true;
  console.log("✅ Socket.IO initialized for real-time features");
  return io;
}

// Safe getIO: returns real io if ready, else a no-op emitter (prevents crashes)
export const getIO = () => {
  if (!io) {
    // Minimal no-op emitter to avoid runtime throws
    const noop = {
      to: () => ({ emit: () => {} }),
      emit: () => {},
      of: () => noop,
    } as any;
    return noop as Server;
  }
  return io!;
};
