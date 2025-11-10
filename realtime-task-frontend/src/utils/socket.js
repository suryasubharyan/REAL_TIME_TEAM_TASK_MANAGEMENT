import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = () => socket;
