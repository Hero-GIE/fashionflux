// server.js or index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", require("./routes/route"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 10MB per file.",
    });
  }

  // Multer file type error
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed (JPEG, PNG, GIF, etc.)",
    });
  }

  // Generic error
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

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, "uploads")}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files from uploads directory
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Request logging middleware (for debugging)
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   next();
// });

// // Routes
// app.use("/api", require("./routes/route"));

// // Root route - ADD THIS
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "🚀 Backend API is running!",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//   });
// });

// // Health check route
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "✅ Server is healthy",
//     database:
//       mongoose.connection.readyState === 1 ? "connected" : "disconnected",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err);

//   // Multer file size error
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return res.status(400).json({
//       success: false,
//       message: "File too large. Maximum size is 10MB per file.",
//     });
//   }

//   // Multer file type error
//   if (err.message === "Only image files are allowed") {
//     return res.status(400).json({
//       success: false,
//       message: "Only image files are allowed (JPEG, PNG, GIF, etc.)",
//     });
//   }

//   // Generic error
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal server error",
//     error: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

// // 404 handler - MUST BE LAST
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.path} not found`,
//   });
// });

// // MongoDB connection with serverless optimization
// let cachedDb = null;

// async function connectToDatabase() {
//   // Return cached connection if available and connected
//   if (cachedDb && mongoose.connection.readyState === 1) {
//     console.log("✅ Using cached MongoDB connection");
//     return cachedDb;
//   }

//   try {
//     console.log("🔄 Creating new MongoDB connection");

//     // Close existing connection if it's in a bad state
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.connection.close();
//     }

//     // Connect with serverless-optimized settings
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       bufferCommands: false,
//       bufferMaxEntries: 0,
//       maxPoolSize: 10,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//     });

//     cachedDb = conn.connection;
//     console.log("✅ MongoDB connected successfully");

//     // Handle connection events
//     mongoose.connection.on("error", (err) => {
//       console.error("❌ MongoDB connection error:", err);
//       cachedDb = null;
//     });

//     mongoose.connection.on("disconnected", () => {
//       console.log("🔌 MongoDB disconnected");
//       cachedDb = null;
//     });

//     return cachedDb;
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error);
//     cachedDb = null;
//     throw error;
//   }
// }

// // Initialize database connection
// connectToDatabase().catch(console.error);

// const PORT = process.env.PORT || 8000;

// // Only listen if not in Vercel environment
// if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📁 Upload directory: ${path.join(__dirname, "uploads")}`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
//   });
// }

// module.exports = app;
