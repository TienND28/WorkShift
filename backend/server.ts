import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { createServer } from "http";
import { ENV, validateEnv } from "./src/config/env.js";
import { connectDB } from "./src/config/database.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import authRoutes from "./src/modules/auth/auth.routes.js";

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const __dirname = path.resolve();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: ENV.corsOrigin,
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (ENV.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "WorkShift API - WorkShipPlatform",
    version: "1.0.0",
    environment: ENV.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);

// Production: Serve static files and handle client-side routing
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Catch-all route for client-side routing (must be before error handlers)
  app.use((req, res, next) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    } else {
      next();
    }
  });
}

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = ENV.port;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log("🚀 WorkShift API Server");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📍 Environment: ${ENV.nodeEnv}`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Connected`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
