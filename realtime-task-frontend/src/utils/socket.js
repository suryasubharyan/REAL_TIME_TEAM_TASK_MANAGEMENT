import { io } from "socket.io-client";

let socket;

export const initSocket = (token) => {
  if (socket) return socket;

  const socketUrl =
    import.meta.env.VITE_SOCKET_URL || "https://backend-g282.onrender.com";

  console.log("🌍 Initializing Socket.io at:", socketUrl);

  socket = io(socketUrl, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("🔴 Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
