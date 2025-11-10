import { Server } from "socket.io";
import http from "http";
import registerTaskHandlers from "../modules/task/socket-handler";
import registerTeamHandlers from "../modules/team/socket-handler";

const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com", // ✅ your deployed frontend
        "http://localhost:5173",              // ✅ dev mode
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // ✅ fallback for Render proxy
    pingInterval: 25000, // ✅ keep connection alive
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    // Register all module socket handlers
    registerTeamHandlers(io, socket);
    registerTaskHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${reason}`);
    });
  });

  return io;
};

export default initializeSocket;
