// backend/routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middleware/auth");

// Cart routes
router.get("/", isAuthenticated, cartController.getCartData);
router.post("/add", isAuthenticated, cartController.addToCart);
router.post("/remove", isAuthenticated, cartController.removeFromCart);
router.put("/update", isAuthenticated, cartController.updateCartItem);
router.delete("/clear", isAuthenticated, cartController.clearCart);

module.exports = router;
