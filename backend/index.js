const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://fashionflux-sage.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173", // Add Vite dev server if needed
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("🚫 Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enhanced request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log(`📋 Headers:`, req.headers);
  next();
});

// Routes
app.use("/api", require("./routes/route"));

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FashionFlux Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ✅ MongoDB connection with enhanced Vercel optimizations
const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      family: 4, // Use IPv4, skip IPv6
    });

    console.log("✅ MongoDB connected successfully");

    // Monitor connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB reconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

connectDB();

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Error:", err);

  // CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Origin not allowed",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 10MB per file.",
    });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed (JPEG, PNG, GIF, etc.)",
    });
  }

  // MongoDB errors
  if (
    err.name === "MongoServerSelectionError" ||
    err.name === "MongoTimeoutError"
  ) {
    return res.status(503).json({
      success: false,
      message: "Database connection timeout. Please try again.",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, "uploads")}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Allowed origins:`, corsOptions.origin);
});

module.exports = app;
