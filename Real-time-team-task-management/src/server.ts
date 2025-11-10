import http from "http";
import app from "./app";
import { initSocket } from "./config/socket";
import initializeSocket, { getIO } from "./helpers/socket.helper";
const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server for Socket.IO
const server = http.createServer(app);

// ✅ Initialize WebSocket (Socket.IO)
initSocket(server);
initializeSocket(server);
// ✅ Start listening
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs available at http://localhost:${PORT}/api/docs`);
});
