import "./Config/env.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import redisClient from "./Config/redis.js";

// --- Import Modular Routers ---
import authRoutes from "./Services/Auth/routes.js";
import tripRoutes from "./Services/Trip/routes.js";
import locationRoutes from "./Services/Location/routes.js";
import placesRoutes from "./Services/Places/routes.js";
import foodRoutes from "./Services/Food/routes.js";
import imageRoutes from "./Services/Image/routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Global Middleware ---
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// --- Logger Middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// --- Global Database Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.warn("⚠️ The server will continue running, but database features will fail. Check your internet connection or MongoDB Atlas whitelist.");
  });

// --- Mount Routers ---
// Matches exact original routes configured for the gateway and client
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

// Location service had /api/autocomplete and /api/geocode logic directly on `app`.
// Since the router maps `/autocomplete`, mapping it to `/api` handles `/api/autocomplete`
app.use("/api", locationRoutes);

app.use("/api/places", placesRoutes);
app.use("/api/food", foodRoutes);

// Image service specifically answered to /api/place-image on app, and its router is just `/`
app.use("/api/place-image", imageRoutes);

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SafarNama Modular Monolith",
    port: PORT,
    redisConnected: !!redisClient
  });
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`🚀 SafarNama running at http://localhost:${PORT}`);
});

// --- Clean Shutdown ---
process.on("SIGINT", () => {
  mongoose.connection.close();
  if (redisClient) {
    redisClient.disconnect();
  }
  console.log("🛑 Server closed gracefully.");
  process.exit(0);
});
