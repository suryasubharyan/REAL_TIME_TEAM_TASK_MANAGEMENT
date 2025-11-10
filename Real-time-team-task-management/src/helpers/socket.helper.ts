import { Server } from "socket.io";
import http from "http";
import registerTaskHandlers from "../modules/task/socket-handler";
import registerTeamHandlers from "../modules/team/socket-handler";

let io: Server; // ✅ Keep a global reference

const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com", // deployed frontend
        "http://localhost:5173",              // local dev
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // ✅ fallback for Render
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    // Register your team & task socket modules
    registerTeamHandlers(io, socket);
    registerTaskHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${reason}`);
    });
  });

  setInterval(() => {
  io.emit("ping", { time: new Date().toISOString() });
}, 25000);

  return io;
};

// ✅ This helper allows other files (like controllers) to emit events
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export default initializeSocket;
