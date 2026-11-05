import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { initSocket } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swirl";

async function startServer() {
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  initSocket(httpServer);

  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB successfully.");
    } else {
      console.log("No MONGODB_URI provided. Running with local seed data provider.");
    }

    httpServer.listen(PORT, () => {
      console.log(`Server + Socket.io running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    console.log("Starting server with local fallback data provider...");
    httpServer.listen(PORT, () => {
      console.log(`Server + Socket.io running on http://localhost:${PORT}`);
    });
  }
}

startServer();
