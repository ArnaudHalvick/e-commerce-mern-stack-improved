// backend/routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const { isAuthenticated, isEmailVerified } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");
const { sanitizeRequest } = require("../middleware/sanitizers");

// Get cart summary without creating payment intent
router.get("/cart-summary", isAuthenticated, paymentController.getCartSummary);

// Payment routes
router.post(
  "/create-payment-intent",
  sanitizeRequest,
  isAuthenticated,
  isEmailVerified,
  paymentController.createPaymentIntent
);

router.post(
  "/confirm-order",
  isAuthenticated,
  isEmailVerified,
  paymentController.confirmOrder
);

router.get("/my-orders", isAuthenticated, paymentController.getMyOrders);

router.get("/order/:id", isAuthenticated, paymentController.getOrderById);

// Get order by payment intent ID
router.get(
  "/order-by-payment/:paymentIntentId",
  isAuthenticated,
  paymentController.getOrderByPaymentIntent
);

// Webhook route - no auth required, comes from Stripe
// This should be exempted from CSRF protection
router.post("/webhook", paymentController.processWebhook);

module.exports = router;
