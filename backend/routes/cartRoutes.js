// backend/routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middleware/auth");

// Cart routes
router.post("/api/cart/add", isAuthenticated, cartController.addToCart);
router.post("/api/cart/remove", isAuthenticated, cartController.removeFromCart);
router.get("/api/cart", isAuthenticated, cartController.getCartData);

module.exports = router;
