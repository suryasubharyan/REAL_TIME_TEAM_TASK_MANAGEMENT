import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Real-Time Team Task Management API",
      version: "1.0.0",
      description:
        "API documentation for the Real-Time Team Task Management System (Node.js + Express + MongoDB). Includes Auth, Team, Project, Task, and Activity modules with JWT-based security.",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local development server",
      },
      {
        url: "https://backend-g282.onrender.com/api",
        description: "Production server (Render)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/*.ts", // All route-level documentation
    "./src/modules/**/*.ts", // Optional: if you use modular structure
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default (app: Express) => {
  // 👇 Serve the Swagger UI at /api/docs
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true, // keeps JWT token even after refresh
      },
    })
  );
};
