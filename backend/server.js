// backend/server.js

// Load environment variables from the appropriate .env file
if (process.env.NODE_ENV === "development") {
  console.log("Loading development environment variables from .env.dev");
  require("dotenv").config({ path: "./.env.dev" });
} else {
  console.log("Loading production environment variables from .env");
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const https = require("https");
const fs = require("fs");
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
const paymentRoutes = require("./routes/paymentRoutes");

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;
const httpsPort = process.env.HTTPS_PORT || 4443;

// Middleware
const allowedOrigins = [
  "http://159.65.230.12",
  "https://159.65.230.12",
  "http://159.65.230.12:8080",
  "https://159.65.230.12:8080",
  "http://159.65.230.12:3000",
  "https://159.65.230.12:3000",
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost",
  "https://localhost",
  "http://localhost:8080",
  "https://localhost:8080",
  "http://127.0.0.1:3000",
  "https://127.0.0.1:3000",
  "http://127.0.0.1:8080",
  "https://127.0.0.1:8080",
  process.env.FRONTEND_URL || "http://localhost:3000",
];

// Configure Morgan for HTTP request logging
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: logger.stream }));

// CORS configuration
if (process.env.NODE_ENV === "development") {
  // More permissive CORS in development mode
  app.use(
    cors({
      origin: true, // Allow any origin in development
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );
  console.log("Running in development mode with permissive CORS");
} else {
  // Modified CORS in production - temporarily more permissive for debugging
  app.use(
    cors({
      origin: true, // Allow any origin temporarily to debug the issue
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );
  console.log(
    "Running in production mode with temporarily permissive CORS for debugging"
  );
}

// Special handling for Stripe webhook (must be raw)
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    // For Stripe webhooks, we need the raw body as a Buffer for signature verification
    let rawBody = Buffer.from([]);

    req.on("data", (chunk) => {
      rawBody = Buffer.concat([rawBody, chunk]);
    });

    req.on("end", () => {
      if (rawBody.length > 0) {
        req.rawBody = rawBody;
      }
      next();
    });
  } else {
    express.json({ limit: "10kb" })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security middleware
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", ...allowedOrigins, "*"],
      connectSrc: ["'self'", ...allowedOrigins, "*"],
      // Add other directives as needed
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
};

// In development, make security headers more permissive
if (process.env.NODE_ENV === "development") {
  app.use(helmet(helmetConfig));
  console.log("Using relaxed security headers in development");
} else {
  app.use(helmet(helmetConfig));
}

app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xssClean()); // Sanitize data against XSS attacks

// Apply global request sanitization
app.use(sanitizeParams); // Sanitize URL parameters for all routes

// Apply a global rate limiter to all requests - but be more permissive in development
if (process.env.NODE_ENV !== "development") {
  app.use("/api/", apiLimiter);
}

// Connect to database
connectDB();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "upload/images");
const placeholdersDir = path.join(__dirname, "upload/images/placeholders");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload/images directory");
}
if (!fs.existsSync(placeholdersDir)) {
  fs.mkdirSync(placeholdersDir, { recursive: true });
  console.log("Created upload/images/placeholders directory");
}

// Serve static files - improved image handling
app.use(
  "/images",
  (req, res, next) => {
    // Allow CORS for images from any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    // Add Cross-Origin Resource Policy header to allow loading from different origins
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    // Add cache control headers
    res.header("Cache-Control", "public, max-age=604800"); // 7 days
    res.header("Expires", new Date(Date.now() + 604800000).toUTCString());

    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    next();
  },
  express.static(path.join(__dirname, "upload/images"), {
    maxAge: "7d",
    etag: true,
    lastModified: true,
    fallthrough: true,
  })
);

// Handle 404 for image requests by serving a placeholder
app.use("/images/*", (req, res) => {
  const placeholderPath = path.join(
    __dirname,
    "upload/images/placeholders/product-placeholder-medium.png"
  );

  // If placeholder exists, serve it, otherwise return 404
  if (fs.existsSync(placeholderPath)) {
    res.sendFile(placeholderPath);
  } else {
    res.status(404).send("Image not found and no placeholder available");
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV });
});

// Routes
app.use("/api", uploadRoutes); // This is for admin I will update it later
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/error-demo", errorDemoRoutes);

// 404 handler - unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
let server;

// Check if HTTPS is enabled
if (process.env.USE_HTTPS === "true") {
  try {
    // Read SSL certificate files
    const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, "utf8");
    const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, "utf8");
    const credentials = { key: privateKey, cert: certificate };

    // Create HTTPS server
    server = https.createServer(credentials, app);

    // Start HTTPS server
    server.listen(httpsPort, () => {
      logger.info(
        `HTTPS Server running on port ${httpsPort} in ${process.env.NODE_ENV} mode`
      );
    });

    // Also start HTTP server for redirection if needed
    app.listen(port, () => {
      logger.info(
        `HTTP Server running on port ${port} in ${process.env.NODE_ENV} mode (consider redirecting to HTTPS)`
      );
    });
  } catch (error) {
    logger.error(`Failed to start HTTPS server: ${error.message}`);
    logger.info("Falling back to HTTP server");

    // Start HTTP server if HTTPS fails
    server = app.listen(port, () => {
      logger.info(
        `Server running on port ${port} in ${process.env.NODE_ENV} mode`
      );
    });
  }
} else {
  // Start HTTP server
  server = app.listen(port, (error) => {
    if (error) {
      console.error("Error starting server:", error);
      process.exit(1);
    }
    logger.info(
      `Server running on port ${port} in ${process.env.NODE_ENV} mode`
    );
  });
}

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
