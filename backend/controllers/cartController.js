// backend/controllers/cartController.js

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
    const { itemId, quantity = 1, size } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    if (!size) {
      return res.status(400).json({
        success: false,
        message: "Size is required",
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

    // Determine the price to use based on whether new_price exists and is greater than 0
    const hasDiscount = product.new_price && product.new_price > 0;
    const priceToUse = hasDiscount ? product.new_price : product.old_price;

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

    // Check if product already in cart with the same size
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === product._id.toString() &&
        item.size === size
    );

    // If product exists in cart with the same size, update quantity
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId: product._id,
        size,
        quantity,
        price: priceToUse,
        name: product.name,
        image:
          product.images && product.images.length > 0
            ? product.images[product.mainImageIndex || 0]
            : "",
        isDiscounted: hasDiscount,
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
    const { itemId, quantity = 1, removeAll = false, size } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    if (!size) {
      return res.status(400).json({
        success: false,
        message: "Size is required",
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === itemId.toString() && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // If removeAll flag is true or quantity is greater than or equal to item quantity, remove item
    if (removeAll || cart.items[itemIndex].quantity <= quantity) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Otherwise, decrease quantity
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
    const { itemId, quantity, size } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    if (!size) {
      return res.status(400).json({
        success: false,
        message: "Size is required",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === itemId.toString() && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
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
