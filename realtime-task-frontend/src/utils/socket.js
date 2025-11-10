import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    console.log("Initializing Socket.io at:", SOCKET_URL);

    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 8000,
      timeout: 20000,
    });

    socket.on("connect", () => console.log("🟢 Connected:", socket.id));
    socket.on("disconnect", (reason) => console.warn("🔴 Disconnected:", reason));
    socket.on("connect_error", (err) => console.error("⚠️ Connect error:", err.message));
  }
  return socket;
};

export const getSocket = () => socket;
