import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    transports: ["websocket", "polling"], // ✅ allow both
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com",
        "http://localhost:5173",
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

export const getIO = () => io;
