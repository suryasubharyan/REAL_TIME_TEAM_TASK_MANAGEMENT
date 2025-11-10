// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://backend-g282.onrender.com";

let socket = null;

export const initSocket = (token) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("🟢 Connected:", socket.id));
  socket.on("disconnect", () => console.log("🔴 Disconnected"));
  socket.on("connect_error", (err) =>
    console.error("⚠️ Socket connect error:", err.message)
  );

  return socket;
};

export const getSocket = () => socket;
