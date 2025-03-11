// backend/controllers/cartController.js

const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get cart data or create a new cart
const getCartData = async (req, res) => {
  try {
    // Find cart by user ID or create a new one
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalPrice: 0,
        totalItems: 0,
      });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart data",
      error: error.message,
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // First try to find product by MongoDB _id
    let product = await Product.findById(itemId).catch(() => null);

    // If not found, try using the numeric id field
    if (!product) {
      product = await Product.findOne({ id: itemId });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find cart or create new one
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalPrice: 0,
        totalItems: 0,
      });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === product._id.toString()
    );

    // If product exists in cart, update quantity
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.new_price,
        name: product.name,
        image: product.image,
      });
    }

    // Recalculate cart totals
    cart.calculateTotals();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    console.error("Request body:", req.body);
    console.error("User ID:", req.user ? req.user.id : "No user ID");
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
    const { itemId, quantity = 1, removeAll = false } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === itemId
    );

    // If item not in cart
    if (itemIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Item not in cart",
      });
    }

    // If removeAll flag is true or quantity is greater than current quantity
    if (removeAll || cart.items[itemIndex].quantity <= quantity) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Decrease the quantity
      cart.items[itemIndex].quantity -= quantity;
    }

    // Recalculate cart totals
    cart.calculateTotals();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// Clear the entire cart
const clearCart = async (req, res) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear items and reset totals
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Item ID and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === itemId
    );

    // If item not in cart
    if (itemIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Item not in cart",
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate cart totals
    cart.calculateTotals();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

module.exports = {
  getCartData,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
};
