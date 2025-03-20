const express = require("express");
const {
  simulateError,
  simulateValidationError,
  simulateDelayedSuccess,
} = require("../controllers/errorDemoController");

const router = express.Router();

// Routes to test error handling
router.get("/test-error", simulateError);
router.get("/validation-error", simulateValidationError);
router.get("/delayed-success", simulateDelayedSuccess);

module.exports = router;
