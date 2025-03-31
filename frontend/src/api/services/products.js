/**
 * Products API service
 * Handles all product-related API calls
 */

import apiClient from "../client";

/**
 * Get all products
 * @param {Object} options - Query options (limit, page, category, etc.)
 * @returns {Promise} Promise with products data
 */
export const getAllProducts = async (options = {}) => {
  try {
    // Use the all-products endpoint as defined in the backend
    const response = await apiClient.get("/api/products/all-products");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} Promise with product data
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise} Promise with product data
 */
export const getProductBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/api/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Promise} Promise with featured products data
 */
export const getFeaturedProducts = async (limit = 4) => {
  try {
    // Use the featured-women endpoint as defined in the backend
    const response = await apiClient.get("/api/products/featured-women");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get new collection products
 * @param {number} limit - Number of products to return
 * @returns {Promise} Promise with new collection products data
 */
export const getNewCollectionProducts = async (limit = 8) => {
  try {
    // Use the newcollection endpoint as defined in the backend
    const response = await apiClient.get("/api/products/newcollection");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get products by category
 * @param {string} category - Category name (men, women, kids)
 * @returns {Promise} Promise with category products data
 */
export const getProductsByCategory = async (category) => {
  try {
    const response = await apiClient.get(`/api/products/category/${category}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get related products
 * @param {string} category - Product category
 * @param {string} productId - Current product ID to exclude
 * @returns {Promise} Promise with related products data
 */
export const getRelatedProducts = async (category, productId) => {
  try {
    const response = await apiClient.get(
      `/api/products/related/${category}/${productId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as products service
const productsService = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  getNewCollectionProducts,
  getProductsByCategory,
  getRelatedProducts,
};

export default productsService;
