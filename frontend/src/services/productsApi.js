import apiClient from "./apiClient";

/**
 * Products API service for handling product operations
 */
const productsApi = {
  /**
   * Get all products with optional filtering
   * @param {object} filters - Optional filters for products
   * @returns {Promise} - Promise that resolves to products data
   */
  getProducts: async (filters = {}) => {
    try {
      const response = await apiClient.get("/api/products/all-products", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to fetch products";
    }
  },

  /**
   * Get a single product by ID
   * @param {string} productId - ID of the product to get
   * @returns {Promise} - Promise that resolves to product data
   */
  getProduct: async (productId) => {
    try {
      const response = await apiClient.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to fetch product";
    }
  },
};

export default productsApi;
