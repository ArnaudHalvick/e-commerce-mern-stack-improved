// backend/index.js

require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Import routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:5173",
];

// For production, uncomment these lines and add your actual domains
if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode");
  // Add production domains if env vars are not set
  if (!process.env.FRONTEND_URL) {
    allowedOrigins.push("https://your-ecommerce-site.com");
  }
  if (!process.env.ADMIN_URL) {
    allowedOrigins.push("https://admin.your-ecommerce-site.com");
  }
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to database
connectDB();

// Serve static files
app.use("/images", express.static(path.join(__dirname, "upload/images")));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", uploadRoutes);
app.use("/api/reviews", reviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(port, (error) => {
  if (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
  console.log(`Server running on port ${port}`);
});
