import { io } from "socket.io-client";

let socket = null;
let isInitialized = false;

export const initSocket = () => {
  if (isInitialized && socket?.connected) return socket;

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "https://backend-g282.onrender.com";

  console.log("🌐 Initializing Socket.io at:", backendURL);

  socket = io(backendURL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    withCredentials: true,
  });

  socket.on("connect", () => {
    isInitialized = true;
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connect error:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    alert("Socket.io not initialized!");
    throw new Error("Socket.io not initialized!");
  }
  return socket;
};
