import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    transports: ["websocket"], // ✅ WebSocket-only mode (Render safe)
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com", // ✅ your deployed frontend
        "http://localhost:5173",              // ✅ local testing
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ [Socket] Connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("❌ [Socket] Disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
