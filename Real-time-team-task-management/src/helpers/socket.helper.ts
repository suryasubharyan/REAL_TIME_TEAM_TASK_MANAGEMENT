import { Server, Socket } from "socket.io";
import http from "http";
import registerTaskHandlers from "../modules/task/socket-handler";
import registerTeamHandlers from "../modules/team/socket-handler";
import jwt from "jsonwebtoken";

let io: Server;

const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Authorization", "Content-Type"],
    },
    path: "/socket.io", // ✅ same path as frontend
    transports: ["websocket", "polling"],
    pingInterval: 25000, // ✅ keep-alive ping for Render
    pingTimeout: 60000,
  });

  // 🔐 JWT verification for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
      socket.data.user = { _id: decoded._id, email: decoded.email };
      next();
    } catch (err: any) {
      console.error("❌ Socket Auth Error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🟢 Connected: ${user?.email || "guest"} (${socket.id})`);

    registerTeamHandlers(io, socket);
    registerTaskHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Disconnected (${reason}) - ${user?.email || "unknown"}`);
    });
  });

  // 🩵 Keep Render from idling the socket
  setInterval(() => {
    io.emit("ping", { time: new Date().toISOString() });
  }, 25000);

  console.log("✅ Socket.IO initialized successfully for Render");
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export default initializeSocket;
