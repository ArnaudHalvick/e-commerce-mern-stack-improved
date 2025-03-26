// backend/server.js

require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const connectDB = require("./config/db");
const AppError = require("./utils/errors/AppError");
const globalErrorHandler = require("./utils/errors/errorHandler");
const logger = require("./utils/common/logger");
const { sanitizeParams } = require("./middleware/validation");
const { apiLimiter } = require("./middleware/rateLimit");

// Import routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const errorDemoRoutes = require("./routes/errorDemoRoutes");
const validationRoutes = require("./routes/validationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  "http://159.65.230.12",
  "http://159.65.230.12:8080",
  "http://localhost:3000",
  "http://localhost",
  process.env.FRONTEND_URL || "http://localhost:3000",
];

// Configure Morgan for HTTP request logging
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: logger.stream }));

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

// Special handling for Stripe webhook (must be raw)
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next();
  } else {
    express.json({ limit: "10kb" })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security middleware
// Configure Helmet with proper CSP settings for images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", ...allowedOrigins],
        connectSrc: ["'self'", ...allowedOrigins],
        // Add other directives as needed
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xssClean()); // Sanitize data against XSS attacks

// Apply global request sanitization
app.use(sanitizeParams); // Sanitize URL parameters for all routes

// Apply a global rate limiter to all requests
app.use("/api/", apiLimiter);

// Connect to database
connectDB();

// Serve static files
app.use(
  "/images",
  (req, res, next) => {
    // Set appropriate CORS headers for images
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    // Add Cross-Origin Resource Policy header
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "upload/images"))
);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api", uploadRoutes); // This is for admin I will update it later
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/error-demo", errorDemoRoutes);
app.use("/api/validation", validationRoutes);

// 404 handler - unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
const server = app.listen(port, (error) => {
  if (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
  logger.info(`Server running on port ${port}`);
});

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION!  Shutting down...", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Handling Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...", {
    error: err.message,
    stack: err.stack,
  });
  server.close(() => {
    process.exit(1);
  });
});
