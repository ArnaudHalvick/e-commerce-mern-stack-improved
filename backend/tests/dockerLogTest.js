/**
 * Docker Log Test Script
 *
 * This script tests whether logging works properly in a Docker container.
 * It directly uses the logger to generate logs.
 */

const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

// Log directory path
const logsDir = path.join(__dirname, "../logs");

// Create test log entries
logger.info("Docker test - info log");
logger.error("Docker test - error log");
logger.warn("Docker test - warning log");
logger.debug("Docker test - debug log");

// Check if log files exist
console.log("Checking for log files...");
setTimeout(() => {
  try {
    const files = fs.readdirSync(logsDir);
    console.log(`Log directory contents (${files.length} files):`);
    files.forEach((file) => {
      const stats = fs.statSync(path.join(logsDir, file));
      console.log(`- ${file} (${stats.size} bytes)`);

      // Print contents of small files
      if (stats.size < 1000) {
        const content = fs.readFileSync(path.join(logsDir, file), "utf8");
        console.log(`  Content: ${content}`);
      }
    });
  } catch (error) {
    console.error("Error checking log files:", error);
  }
}, 500); // Small delay to ensure logs are flushed
