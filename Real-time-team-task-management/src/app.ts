import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { connectDB } from "./config/database";
import cors from "cors";
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

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://frontend-isaq.onrender.com", // your deployed frontend
  "http://localhost:5173",              // Vite default dev port
  "http://localhost:5174",              // alt port (Edge or VSCode preview)
  "http://127.0.0.1:5173",              // optional localhost variant
];

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// ✅ Use CORS before JSON parsing
app.use(cors(corsOptions));

// ✅ Express body parser
app.use(express.json());

// ✅ Optional preflight handler for any route
app.options("*", cors(corsOptions));

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
