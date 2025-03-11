// backend/routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middleware/auth");

// Cart routes
router.get("/cart", isAuthenticated, cartController.getCartData);
router.post("/cart/add", isAuthenticated, cartController.addToCart);
router.post("/cart/remove", isAuthenticated, cartController.removeFromCart);
router.put("/cart/update", isAuthenticated, cartController.updateCartItem);
router.delete("/cart/clear", isAuthenticated, cartController.clearCart);

module.exports = router;
