import express from "express";
import cors from "cors";
import restaurantRoutes from "./routes/restaurant.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Restaurant routes
app.use("/api/restaurants", restaurantRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint ${req.originalUrl} not found`));
});

// Central error handler
app.use(errorHandler);

export default app;
