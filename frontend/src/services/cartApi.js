import apiClient from "./apiClient";

/**
 * Cart API service for handling shopping cart operations
 */
const cartApi = {
  /**
   * Get the user's cart
   * @returns {Promise} - Promise that resolves to cart data
   */
  getCart: async () => {
    try {
      const response = await apiClient.get("/api/cart");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to fetch cart";
    }
  },

  /**
   * Add an item to the cart
   * @param {object} cartItem - Item to add to cart (itemId, quantity, size)
   * @returns {Promise} - Promise that resolves to updated cart
   */
  addToCart: async (cartItem) => {
    try {
      // Rename itemId to productId as required by the backend
      const { itemId, ...rest } = cartItem;
      const payload = {
        productId: itemId, // Convert itemId to productId
        ...rest,
      };

      const response = await apiClient.post("/api/cart/add", payload);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to add item to cart"
      );
    }
  },

  /**
   * Remove an item from the cart
   * @param {object} params - Parameters (itemId, quantity, removeAll, size)
   * @returns {Promise} - Promise that resolves to updated cart
   */
  removeFromCart: async ({ itemId, quantity = 1, removeAll = false, size }) => {
    try {
      const response = await apiClient.post("/api/cart/remove", {
        itemId,
        quantity,
        removeAll,
        size,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to remove item from cart"
      );
    }
  },

  /**
   * Update cart item quantity
   * @param {object} params - Parameters (itemId, quantity, size)
   * @returns {Promise} - Promise that resolves to updated cart
   */
  updateCartItem: async ({ itemId, quantity, size }) => {
    try {
      const response = await apiClient.post("/api/cart/update", {
        itemId,
        quantity,
        size,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to update cart item"
      );
    }
  },

  /**
   * Clear the cart
   * @returns {Promise} - Promise that resolves to empty cart
   */
  clearCart: async () => {
    try {
      const response = await apiClient.delete("/api/cart/clear");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to clear cart";
    }
  },
};

export default cartApi;
