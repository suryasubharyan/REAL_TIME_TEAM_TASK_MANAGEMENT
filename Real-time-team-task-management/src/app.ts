import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { connectDB } from "./config/database";

import authRoutes from "./routes/auth.routes";
import teamRoutes from "./routes/team.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config();

// ✅ Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
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

// ✅ Health Check route
app.get("/", (_, res) => {
  res.send("✅ Real-Time Team Task Management API is running...");
});

export default app;
