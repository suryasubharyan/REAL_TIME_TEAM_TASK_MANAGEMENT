import http from "http";
import app from "./app";
import initializeSocket from "./helpers/socket.helper";

const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Initialize WebSocket (only once)
initializeSocket(server);

// ✅ Start listening
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs available at http://localhost:${PORT}/api/docs`);
});
