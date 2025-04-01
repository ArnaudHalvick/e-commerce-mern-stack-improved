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
 * @param {string} color - Color of the product
 * @returns {Promise} Promise with updated cart data
 */
export const addToCart = async ({ itemId, quantity = 1, size, color }) => {
  try {
    // Ensure we have an auth token
    const token = localStorage.getItem("auth-token");
    if (!token) {
      throw new Error("Authentication required to update cart");
    }

    // Validate size - ensure it's a string and not null/undefined
    if (!size) {
      throw new Error("Size is required when adding an item to cart");
    }

    // Log the request
    console.log("Adding to cart:", {
      productId: itemId,
      quantity,
      size,
      color,
    });

    // Make the request with the exact parameter names expected by the backend
    const response = await apiClient.post("/api/cart/add", {
      productId: itemId, // API expects 'productId' not 'itemId'
      quantity,
      size: size, // Size is required in backend, don't use null fallback
      color: color || null,
    });

    // Validate response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    return response.data;
  } catch (error) {
    // Log detailed error for debugging
    console.error(
      "Cart add error:",
      error?.response?.data || error.message || error
    );

    // Re-throw to let the caller handle it
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} itemId - Product ID
 * @param {number} quantity - New quantity
 * @param {string} size - Size of the product
 * @param {string} color - Color of the product
 * @returns {Promise} Promise with updated cart data
 */
export const updateCartItem = async ({ itemId, quantity, size, color }) => {
  try {
    // Ensure we have an auth token
    const token = localStorage.getItem("auth-token");
    if (!token) {
      throw new Error("Authentication required to update cart");
    }

    // Validate size - ensure it's a string and not null/undefined
    if (!size) {
      throw new Error("Size is required when updating a cart item");
    }

    // Log the request
    console.log("Updating cart item:", {
      productId: itemId,
      quantity,
      size,
      color,
    });

    // Make the request with the exact parameter names expected by the backend
    const response = await apiClient.post("/api/cart/update", {
      productId: itemId,
      quantity,
      size: size, // Size is required in backend
      color: color || null,
    });

    // Validate response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    return response.data;
  } catch (error) {
    // Log detailed error for debugging
    console.error(
      "Cart update error:",
      error?.response?.data || error.message || error
    );

    // Re-throw to let the caller handle it
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} itemId - Product ID
 * @param {number} quantity - Quantity to remove (if not removeAll)
 * @param {boolean} removeAll - Whether to remove all quantity of the item
 * @param {string} size - Size of the product
 * @param {string} color - Color of the product
 * @returns {Promise} Promise with updated cart data
 */
export const removeFromCart = async ({
  itemId,
  quantity = 1,
  removeAll = false,
  size,
  color,
}) => {
  try {
    // Ensure we have an auth token
    const token = localStorage.getItem("auth-token");
    if (!token) {
      throw new Error("Authentication required to update cart");
    }

    // Validate size - ensure it's a string and not null/undefined
    if (!size) {
      throw new Error("Size is required when removing an item from cart");
    }

    // Log the request
    console.log("Removing from cart:", {
      productId: itemId,
      quantity,
      removeAll,
      size,
      color,
    });

    // Make the request with the exact parameter names expected by the backend
    const response = await apiClient.post("/api/cart/remove", {
      productId: itemId, // API expects 'productId' not 'itemId'
      quantity,
      removeAll,
      size: size, // Size is required in backend, don't use null fallback
      color: color || null,
    });

    // Validate response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    return response.data;
  } catch (error) {
    // Log detailed error for debugging
    console.error(
      "Cart remove error:",
      error?.response?.data || error.message || error
    );

    // Re-throw to let the caller handle it
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
