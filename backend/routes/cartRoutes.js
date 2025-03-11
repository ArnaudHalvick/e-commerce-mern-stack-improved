const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const fetchUser = require("../middleware/auth");

// Cart routes
router.post("/add-to-cart", fetchUser, cartController.addToCart);
router.post("/remove-from-cart", fetchUser, cartController.removeFromCart);
router.post("/get-cart-data", fetchUser, cartController.getCartData);

module.exports = router;
