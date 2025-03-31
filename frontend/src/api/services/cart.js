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
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise} Promise with updated cart data
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await apiClient.post("/api/cart/items", {
      productId,
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Promise with updated cart data
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await apiClient.put(`/api/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} itemId - Cart item ID
 * @returns {Promise} Promise with updated cart data
 */
export const removeFromCart = async (itemId) => {
  try {
    const response = await apiClient.delete(`/api/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise} Promise with empty cart data
 */
export const clearCart = async () => {
  try {
    const response = await apiClient.delete("/api/cart");
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
    const response = await apiClient.get("/api/cart/summary");
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
