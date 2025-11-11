import http from "http";
import app from "./app";
import initializeSocket from "./helpers/socket.helper";

const PORT = process.env.PORT || 5000;

// ✅ Create server
const server = http.createServer(app);

// ✅ Trust proxy (important for Render)
app.set("trust proxy", 1);

// ✅ Initialize socket
initializeSocket(server);

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📘 Swagger Docs: /api/docs`);
});
