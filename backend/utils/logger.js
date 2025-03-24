// backend/utils/logger.js

/**
 * Logger utility based on Winston
 *
 * Provides different log levels based on environment and formats logs appropriately.
 * In production, errors are logged to console and to files for later analysis.
 */

const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
    }`;
  })
);

// Custom format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Different transports based on environment
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    format: consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === "production") {
  transports.push(
    // Log all errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Log combined output to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
  exitOnError: false,
});

// Add stream for Morgan integration
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
