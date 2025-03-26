const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");
const { sanitizeRequest } = require("../middleware/sanitizers");

// Payment routes
router.post(
  "/create-payment-intent",
  sanitizeRequest,
  isAuthenticated,
  paymentController.createPaymentIntent
);

router.post(
  "/confirm-order",
  sanitizeRequest,
  isAuthenticated,
  paymentController.confirmOrder
);

router.get("/my-orders", isAuthenticated, paymentController.getMyOrders);

router.get("/order/:id", isAuthenticated, paymentController.getOrderById);

// Webhook route - no auth required, comes from Stripe
// This should be exempted from CSRF protection
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.processWebhook
);

module.exports = router;
