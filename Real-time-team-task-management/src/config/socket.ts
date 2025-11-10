import { Server, Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

// Map to track connected users and their active rooms
const userConnections = new Map<string, { userId: string; rooms: Set<string> }>();

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://frontend-isaq.onrender.com",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // ✅ Render-safe fallback
  });

  // 🧠 Auth middleware (using your JWT)
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
      socket.data.user = { id: decoded._id, email: decoded.email };
      next();
    } catch (err: any) {
      console.error("❌ Socket Auth Error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log(`⚡ User connected: ${user?.email} (${socket.id})`);

    // Add connection to map
    userConnections.set(socket.id, { userId: user?.id, rooms: new Set() });

    // ✅ Join Team or Project Room
    socket.on("join-room", (roomId: string) => {
      if (!roomId) return;
      socket.join(roomId);
      userConnections.get(socket.id)?.rooms.add(roomId);
      console.log(`📢 ${user.email} joined room ${roomId}`);
      socket.emit("joined-room", { roomId });
    });

    // ✅ Leave Room
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      userConnections.get(socket.id)?.rooms.delete(roomId);
      console.log(`🚪 ${user.email} left room ${roomId}`);
    });

    // ✅ Task created (real-time broadcast to team)
    socket.on("task-created", (task) => {
      const { teamId } = task;
      console.log(`🆕 Task created in team ${teamId}:`, task);
      io.to(teamId).emit("task-updated", task);
    });

    // ✅ Task status updated
    socket.on("task-status-changed", (task) => {
      console.log(`📋 Task status changed: ${task._id} → ${task.status}`);
      io.to(task.teamId).emit("task-status-updated", task);
    });

    // ✅ Team info updated (e.g., member added, role updated)
    socket.on("team-updated", (team) => {
      console.log(`👥 Team updated: ${team._id}`);
      io.to(team._id).emit("team-refresh", team);
    });

    // ✅ Notify project-level updates
    socket.on("project-updated", (project) => {
      console.log(`📁 Project updated: ${project._id}`);
      io.to(project._id).emit("project-refresh", project);
    });

    // ✅ Typing indicator in project chat
    socket.on("typing", (roomId) => {
      socket.to(roomId).emit("user-typing", { user: user.email });
    });

    socket.on("stop-typing", (roomId) => {
      socket.to(roomId).emit("user-stop-typing", { user: user.email });
    });

    // ✅ Disconnect user
    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${user.email} (${socket.id})`);
      userConnections.delete(socket.id);
      io.emit("user-disconnected", { user: user.email });
    });
  });

  console.log("✅ Socket.IO initialized and ready");
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
