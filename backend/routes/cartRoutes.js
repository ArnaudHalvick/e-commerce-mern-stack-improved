// backend/routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middleware/auth");

// Cart routes
router.post("/cart/add", isAuthenticated, cartController.addToCart);
router.post("/cart/remove", isAuthenticated, cartController.removeFromCart);
router.get("/cart", isAuthenticated, cartController.getCartData);

module.exports = router;
