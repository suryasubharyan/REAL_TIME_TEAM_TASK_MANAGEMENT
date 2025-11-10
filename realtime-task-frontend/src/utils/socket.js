// src/utils/socket.js
import { io } from "socket.io-client";

let socket;

export function initSocket() {
  if (socket) return socket;

  const backend = import.meta.env.VITE_API_BASE_URL || "https://backend-g282.onrender.com";

  socket = io(backend, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    // send token for auth
    auth: {
      token: localStorage.getItem("token") || null,
    },
  });

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
  socket.on("connect_error", (err) => console.error("Socket connect error:", err.message));

  return socket;
}

export function getSocket() {
  return socket;
}
