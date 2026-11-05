import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import * as Sentry from "@sentry/node";

import restaurantRoutes from "./routes/restaurant.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import restaurantPanelRoutes from "./routes/restaurantPanel.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ApiError } from "./utils/ApiError.js";
import { requestLogger, logger } from "./utils/logger.js";
import { isRedisAvailable } from "./utils/redis.js";

// Optional Sentry Initialization
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });
  logger.info("🛡️ [Sentry] Error tracking initialized");
}

const app = express();

// Trust reverse proxy (Vercel, Render, Nginx, Cloudflare)
app.set("trust proxy", 1);

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

// CORS Policy
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes("localhost") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin === process.env.CLIENT_ORIGIN
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Prevent NoSQL Injection attacks (strips $ and .)
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// Global Rate Limiting
const isTest = process.env.NODE_ENV === "test";
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api", globalLimiter);

// Stricter Rate Limiting on Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// Basic Uptime Health Check (for Render / Pingdom / BetterStack / UptimeRobot)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Detailed Diagnostic Health Check
app.get("/api/health/detailed", (req, res) => {
  const mongoStatus = ["Disconnected", "Connected", "Connecting", "Disconnecting"][
    mongoose.connection.readyState
  ] || "Unknown";

  res.status(200).json({
    status: "OK",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    memoryUsage: process.memoryUsage(),
    services: {
      mongodb: {
        status: mongoStatus,
        connected: mongoose.connection.readyState === 1,
      },
      redis: {
        status: isRedisAvailable() ? "Connected" : "Disconnected (using direct DB/seed fallback)",
        connected: isRedisAvailable(),
      },
      nodeVersion: process.version,
    },
  });
});

// Mount Core API Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restaurant", restaurantPanelRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint ${req.originalUrl} not found`));
});

// Central error handler
app.use(errorHandler);

export default app;
