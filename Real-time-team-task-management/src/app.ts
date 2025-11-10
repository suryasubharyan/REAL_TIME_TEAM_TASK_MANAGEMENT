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

// ✅ Initialize Express
const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "https://frontend-isaq.onrender.com", // your deployed frontend on Render
  "http://localhost:5173",              // local Vite dev environment
];

// ✅ Proper CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle Preflight Requests
app.options("*", cors());

// ✅ Parse incoming JSON
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
