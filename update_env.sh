#!/bin/bash

# Update frontend .env for production
cat > frontend/.env << EOL
# API URL for production
REACT_APP_API_URL=http://159.65.230.12
EOL

# Update admin .env for production
cat > admin/.env << EOL
# API URL for production
VITE_API_URL=http://159.65.230.12
EOL

# Update backend CORS settings in index.js by directly editing the file
echo "Updating CORS settings in backend/index.js"
cat > backend/index.js.new << EOL
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
  "http://159.65.230.12", 
  "http://159.65.230.12:8080",
  "http://localhost:3000",
  "http://localhost",
  process.env.FRONTEND_URL || "http://localhost:3000"
];

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
EOL

# Replace the old file with the new one
mv backend/index.js.new backend/index.js

echo "Environment files updated successfully for IP: 159.65.230.12" 