import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (socket) return socket;

  socket = io("https://backend-g282.onrender.com", {
    transports: ["websocket", "polling"], // allow both
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connect error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
