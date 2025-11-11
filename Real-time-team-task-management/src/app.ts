import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import path from "path";
import { connectDB } from "./config/database";

import authRoutes from "./routes/auth.routes";
import teamRoutes from "./routes/team.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import activityRoutes from "./routes/activity.routes";

// ✅ Import Swagger setup (auto-docs from your routes)
import swaggerDocs from "./config/swagger";

dotenv.config();

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize Express
const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://frontend-isaq.onrender.com", // deployed frontend
  "http://localhost:5173",              // Vite dev port
  "http://localhost:5174",              // alternate dev
  "http://127.0.0.1:5173",
];

// ✅ Type-safe CORS configuration
const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void {
    if (!origin) return callback(null, true); // allow Postman, internal
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS blocked from origin: ${origin}`));
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
app.use(express.json());

// ✅ Optional preflight handler for socket.io and all routes
app.options("*", cors(corsOptions));
app.options("/socket.io/*", cors(corsOptions));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/activity", activityRoutes);

// ✅ Swagger Documentation (auto-generated from JSDoc)
swaggerDocs(app);

// ✅ Health Check route
app.get("/", (_: Request, res: Response) => {
  res.send(`
    <h2>✅ Real-Time Team Task Management API</h2>
    <p>Server is running successfully.</p>
    <p>Visit <a href="/api/docs">/api/docs</a> to explore the API documentation.</p>
  `);
});

export default app;
