import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swirl";

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB successfully.");
    } else {
      console.log("No MONGODB_URI provided. Running with local seed data provider.");
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    console.log("Starting server with local fallback data provider...");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
