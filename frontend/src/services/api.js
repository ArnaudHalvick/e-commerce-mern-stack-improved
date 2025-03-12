import axios from "axios";

// Base URL for API requests - you can modify this to read from env vars
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Reusable axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers["auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Reviews API
export const reviewsApi = {
  /**
   * Get reviews for a product with pagination and sorting
   * @param {string} productId - ID of the product to get reviews for
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of reviews per page
   * @param {string} sort - Sort option (date-desc, date-asc, rating-desc, rating-asc)
   * @returns {Promise} - Promise that resolves to reviews data
   */
  getProductReviews: async (
    productId,
    page = 1,
    limit = 5,
    sort = "date-desc"
  ) => {
    try {
      const response = await apiClient.get(
        `/api/reviews/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw error.message;
      } else {
        throw new Error("Failed to fetch reviews");
      }
    }
  },

  /**
   * Add a new review for a product
   * @param {object} reviewData - Review data to submit
   * @returns {Promise} - Promise that resolves to the created review
   */
  addReview: async (reviewData) => {
    try {
      const response = await apiClient.post("/api/reviews", reviewData);
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw error.message;
      } else {
        throw new Error("Failed to add review");
      }
    }
  },
};

// Products API
export const productsApi = {
  /**
   * Get all products with optional filtering
   * @param {object} filters - Optional filters for products
   * @returns {Promise} - Promise that resolves to products data
   */
  getProducts: async (filters = {}) => {
    try {
      const response = await apiClient.get("/api/products", {
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

// Cart API
export const cartApi = {
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
      const response = await apiClient.post("/api/cart/add", cartItem);
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

// Export default for convenience
const apiServices = {
  reviewsApi,
  productsApi,
  cartApi,
};

export default apiServices;
