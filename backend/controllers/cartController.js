// backend/controllers/cartController.js

const User = require("../models/User");

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const userData = await User.findById(req.user.id);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize if undefined
    if (!userData.cartData[itemId]) {
      userData.cartData[itemId] = 0;
    }

    userData.cartData[itemId] += 1;
    await userData.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      quantity: userData.cartData[itemId],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const userData = await User.findById(req.user.id);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!userData.cartData[itemId] || userData.cartData[itemId] === 0) {
      return res.status(400).json({
        success: false,
        message: "Item not in cart",
      });
    }

    userData.cartData[itemId] -= 1;
    await userData.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      quantity: userData.cartData[itemId],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// Get cart data
const getCartData = async (req, res) => {
  try {
    const userData = await User.findById(req.user.id);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert cart data to a more useful format
    const cartItems = Object.entries(userData.cartData)
      .filter(([_, quantity]) => quantity > 0)
      .reduce((acc, [itemId, quantity]) => {
        acc[itemId] = quantity;
        return acc;
      }, {});

    res.status(200).json({
      success: true,
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart data",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getCartData,
};
