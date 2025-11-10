import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket", "polling"], // ✅ fallback added
      withCredentials: true,
      reconnectionAttempts: 5,
      timeout: 20000, // 20s for Render wakeup
    });

    socket.on("connect", () => {
      console.log("🟢 [Socket] Connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 [Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ [Socket] Connection Error:", err.message);
    });
  }

  return socket;
};

export const getSocket = () => socket;
