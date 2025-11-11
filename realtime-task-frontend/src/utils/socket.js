import { io } from "socket.io-client";

let socket = null;
let isInitialized = false;

export const initSocket = (token) => {
  if (isInitialized && socket?.connected) return socket;

  const backendURL =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "";

  console.log("🌐 Initializing Socket.io at:", backendURL);

  socket = io(backendURL, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: { token }, // ✅ JWT auth sent here
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
  });

  socket.on("connect", () => {
    isInitialized = true;
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connect error:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket || !isInitialized) {
    console.warn("⚠️ Socket.io not initialized yet!");
    return null;
  }
  return socket;
};
