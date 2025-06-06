// backend/controllers/cartController.js

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");

// Get cart data or create a new cart
const getCartData = catchAsync(async (req, res, next) => {
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
});

// Add item to cart
const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, size } = req.body;

  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  if (!size) {
    return next(new AppError("Size is required", 400));
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: [],
      totalPrice: 0,
      totalItems: 0,
    });
  }

  // Fetch product details to ensure it exists and get price
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if product is available
  if (product.available === false) {
    return next(new AppError("Product is not available", 400));
  }

  // Determine if the product has a discount
  const hasDiscount =
    product.new_price &&
    product.new_price > 0 &&
    product.new_price < product.old_price;

  // Calculate the price to use (for total calculation)
  const displayPrice = hasDiscount ? product.new_price : product.old_price;

  // Check if the item with the same size already exists in the cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId && item.size === size
  );

  // If the item exists, update the quantity
  if (existingItemIndex !== -1) {
    cart.items[existingItemIndex].quantity += quantity;
    // Make sure price information is up to date
    cart.items[existingItemIndex].price = displayPrice;
    cart.items[existingItemIndex].old_price = product.old_price;
    cart.items[existingItemIndex].new_price = hasDiscount
      ? product.new_price
      : 0;
    cart.items[existingItemIndex].hasDiscount = hasDiscount;
  } else {
    // Otherwise, add a new item with discount information
    cart.items.push({
      productId: productId,
      quantity,
      size,
      price: displayPrice,
      old_price: product.old_price,
      new_price: hasDiscount ? product.new_price : 0,
      hasDiscount,
      name: product.name,
      image: product.mainImage || (product.images && product.images[0]),
    });
  }

  // Recalculate total price and items
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  res.status(200).json({
    success: true,
    cart,
    message: "Item added to cart successfully",
  });
});

// Remove item from cart
const removeFromCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, size, removeAll = false } = req.body;

  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  // Find cart
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Find the index of the item to remove
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId && (!size || item.size === size)
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  // Remove the item from the cart or reduce quantity
  if (removeAll) {
    cart.items.splice(itemIndex, 1);
  } else {
    // Reduce quantity
    cart.items[itemIndex].quantity -= quantity;

    // If quantity becomes 0, remove the item
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
  }

  // Recalculate total price and items
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  res.status(200).json({
    success: true,
    cart,
    message: "Item removed from cart successfully",
  });
});

// Clear cart
const clearCart = catchAsync(async (req, res, next) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });

    // If cart doesn't exist, create an empty one
    if (!cart) {
      const newCart = new Cart({
        user: req.user.id,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });

      await newCart.save();

      return res.status(200).json({
        success: true,
        cart: newCart,
        message: "Cart created and is already empty",
      });
    }

    // Clear all items
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    return res.status(200).json({
      success: true,
      cart,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return next(new AppError("Failed to clear cart: " + error.message, 500));
  }
});

// Update cart item
const updateCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity, size } = req.body;

  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  if (!quantity || quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  // Find cart
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Find the index of the item to update
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId && (!size || item.size === size)
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  // Update the item quantity
  cart.items[itemIndex].quantity = quantity;

  if (size && size !== cart.items[itemIndex].size) {
    // If size is changing, fetch latest product info to ensure price is current
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    // Determine if the product has a discount
    const hasDiscount =
      product.new_price &&
      product.new_price > 0 &&
      product.new_price < product.old_price;

    // Calculate the price to use (for total calculation)
    const displayPrice = hasDiscount ? product.new_price : product.old_price;

    // Update all product info with clear price structure
    cart.items[itemIndex].size = size;
    cart.items[itemIndex].price = displayPrice;
    cart.items[itemIndex].old_price = product.old_price;
    cart.items[itemIndex].new_price = hasDiscount ? product.new_price : 0;
    cart.items[itemIndex].hasDiscount = hasDiscount;
  }

  // Recalculate total price and items
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  res.status(200).json({
    success: true,
    cart,
    message: "Cart item updated successfully",
  });
});

module.exports = {
  getCartData,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
};
