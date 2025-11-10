import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Real-Time Team Task Management System API",
        version: "1.0.0",
        description:
          "This is the official API documentation for the Real-Time Team Task Management System. Built with Node.js, TypeScript, MongoDB, and Socket.IO.",
        contact: {
          name: "shubham",
          email: "suryasubharyan@gmail.com",
        },
      },
      servers: [
        {
          url: process.env.BASE_URL || "http://localhost:5000/api",
          description: "Local development server",
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
      security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"],
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
