/**
 * Cart API service
 * Handles all cart-related API calls
 */

import apiClient from "../client";

/**
 * Get user's cart
 * @returns {Promise} Promise with cart data
 */
export const getCart = async () => {
  try {
    const response = await apiClient.get("/api/cart");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add item to cart
 * @param {string} itemId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {string} size - Size of the product
 * @returns {Promise} Promise with updated cart data
 */
export const addToCart = async ({ itemId, quantity = 1, size }) => {
  try {
    // Validate size - ensure it's a string and not null/undefined
    if (!size) {
      throw new Error("Size is required when adding an item to cart");
    }

    // Make the request with the exact parameter names expected by the backend
    const response = await apiClient.post("/api/cart/add", {
      productId: itemId, // API expects 'productId' not 'itemId'
      quantity,
      size,
    });

    return response.data;
  } catch (error) {
    console.error("Cart add error:", error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} itemId - Product ID
 * @param {number} quantity - New quantity
 * @param {string} size - Size of the product
 * @returns {Promise} Promise with updated cart data
 */
export const updateCartItem = async ({ itemId, quantity, size }) => {
  try {
    // Validate size - ensure it's a string and not null/undefined
    if (!size) {
      throw new Error("Size is required when updating a cart item");
    }

    // Make the request with the exact parameter names expected by the backend
    const response = await apiClient.post("/api/cart/update", {
      productId: itemId,
      quantity,
      size,
    });

    return response.data;
  } catch (error) {
    console.error("Cart update error:", error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} itemId - Product ID
 * @param {number} quantity - Quantity to remove (if not removeAll)
 * @param {boolean} removeAll - Whether to remove all quantity of the item
 * @param {string} size - Size of the product
 * @returns {Promise} Promise with updated cart data
 */
export const removeFromCart = async ({
  itemId,
  quantity = 1,
  removeAll = false,
  size,
}) => {
  try {
    // Validate size - ensure it's a string and not null/undefined
    if (!size) {
      throw new Error("Size is required when removing an item from cart");
    }

    // Create payload matching what worked in Postman
    const payload = {
      productId: itemId, // API expects 'productId' not 'itemId'
      size,
    };

    // Only add these parameters if they're actually needed
    if (!removeAll) {
      payload.quantity = quantity;
    }
    if (removeAll) {
      payload.removeAll = true;
    }

    // Log the request
    console.log("Removing from cart:", payload);

    // Make the request with the exact parameter names expected by the backend
    const response = await apiClient.post("/api/cart/remove", payload);

    return response.data;
  } catch (error) {
    console.error("Cart remove error:", error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise} Promise with empty cart data
 */
export const clearCart = async () => {
  try {
    const response = await apiClient.delete("/api/cart/clear");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Apply coupon to cart
 * @param {string} couponCode - Coupon code
 * @returns {Promise} Promise with updated cart data
 */
export const applyCoupon = async (couponCode) => {
  try {
    const response = await apiClient.post("/api/cart/coupon", {
      code: couponCode,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove coupon from cart
 * @returns {Promise} Promise with updated cart data
 */
export const removeCoupon = async () => {
  try {
    const response = await apiClient.delete("/api/cart/coupon");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get cart summary (totals, items count, etc.)
 * @returns {Promise} Promise with cart summary data
 */
export const getCartSummary = async () => {
  try {
    const response = await apiClient.get("/api/payment/cart-summary");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Sync local cart with server (for when user logs in)
 * @param {Array} items - Local cart items
 * @returns {Promise} Promise with updated cart data
 */
export const syncCart = async (items) => {
  try {
    const response = await apiClient.post("/api/cart/sync", { items });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as cart service
const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartSummary,
  syncCart,
};

export default cartService;
