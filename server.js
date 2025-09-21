import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import blockchainRoutes from "./routes/blockchain.js";

dotenv.config();

const startServer = async () => {
  const app = express();

  // --- Middleware ---
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- MongoDB Connection ---
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bluecarbon";
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected 🚀");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }

  // --- Wait for Hardhat Node ---
  const waitForHardhatNode = async (url = "http://127.0.0.1:8545") => {
    const RETRIES = 20;
    const DELAY = 1000; // 1 second
    for (let i = 0; i < RETRIES; i++) {
      try {
        const res = await fetch(url);
        if (res.ok || res.status === 200 || res.status === 405) {
          console.log("✅ Hardhat node detected, continuing server startup");
          return true;
        }
      } catch (err) {
        console.log(`⏳ Waiting for Hardhat node... (${i + 1}/${RETRIES})`);
      }
      await new Promise((r) => setTimeout(r, DELAY));
    }
    console.warn("⚠️ Hardhat node not detected. Blockchain APIs may fail.");
    return false;
  };

  await waitForHardhatNode();

  // --- Routes ---
  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/blockchain", blockchainRoutes);

  // --- Root Endpoint ---
  app.get("/", (req, res) => {
    res.json({ status: "success", message: "Blue Carbon Backend is running ✅" });
  });

  // --- Global Error Handler ---
  app.use((err, req, res, next) => {
    console.error("💥 Server Error:", err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  });

  // --- Start Server ---
  const PORT = process.env.PORT || 5001;
  const server = app.listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT}`);

    // --- PM2 Ready Signal ---
    if (process.send) {
      process.send("ready"); // PM2 will know backend is ready
    }
  });

  // --- Graceful Shutdown ---
  const gracefulShutdown = async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await mongoose.disconnect();
    server.close(() => {
      console.log("✅ Server closed. MongoDB disconnected.");
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
};

// --- Initialize ---
startServer().catch((err) => {
  console.error("💥 Fatal error during startup:", err);
  process.exit(1);
});
