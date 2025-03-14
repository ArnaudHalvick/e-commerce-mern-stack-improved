// admin/src/services/api.js
import axios from "axios";

// Base URL for API requests
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.your-ecommerce-site.com" // Change this to your actual production API domain
    : "http://localhost:4000");

console.log("Admin API Base URL:", API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies/auth
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin-token");
    if (token) {
      config.headers["auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Product API service
export const productApi = {
  // Upload product image
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("product", imageFile);

      const response = await apiClient.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error.response?.data || error.message || "Failed to upload image";
    }
  },

  // Add new product
  addProduct: async (productData) => {
    try {
      const response = await apiClient.post("/api/add-product", productData);
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error.response?.data || error.message || "Failed to add product";
    }
  },

  // Get all products
  getAllProducts: async () => {
    try {
      const response = await apiClient.get("/api/all-products");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error.response?.data || error.message || "Failed to fetch products";
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await apiClient.post("/api/remove-product", {
        id: productId,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error.response?.data || error.message || "Failed to delete product";
    }
  },
};

// Auth API service
export const authApi = {
  // Admin login
  login: async (username, password) => {
    try {
      const response = await apiClient.post("/api/admin-login", {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error.response?.data || error.message || "Failed to login";
    }
  },
};

export default apiClient;
