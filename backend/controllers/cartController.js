// backend/controllers/cartController.js

const User = require("../models/User");

// Add item to cart
const addToCart = async (req, res) => {
  try {
    console.log("Added ", req.body.itemId);
    let userData = await User.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
    );
    res.send("Added");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    console.log("Removed ", req.body.itemId);
    let userData = await User.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) {
      userData.cartData[req.body.itemId] -= 1;
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { cartData: userData.cartData }
      );
      res.send("Removed");
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get cart data
const getCartData = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: req.user.id });
    res.send(userData.cartData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getCartData,
};
