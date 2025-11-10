import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { connectDB } from "./config/database";

import authRoutes from "./routes/auth.routes";
import teamRoutes from "./routes/team.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import activityRoutes from "./routes/activity.routes";
dotenv.config();

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize Express
const app = express();

// ✅ Allowed origins (Frontend URLs)
const allowedOrigins = [
  "https://frontend-isaq.onrender.com", // your frontend hosted on Render
  "http://localhost:5173",              // local dev
];

// ✅ Apply CORS manually (Render-safe)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // Preflight success
  }
  next();
});

app.use(express.json());

// ✅ Load Swagger YAML file safely
const swaggerPath = path.join(__dirname, "../swagger.yaml");
const swaggerDoc = YAML.load(swaggerPath);

// ✅ Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ✅ Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/activity", activityRoutes);
// ✅ Health Check route
app.get("/", (_, res) => {
  res.send("✅ Real-Time Team Task Management API is running...");
});

export default app;
