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
    const { limit, page, category, featured, search, sort } = options;
    let url = "/api/products?";

    if (limit) url += `limit=${limit}&`;
    if (page) url += `page=${page}&`;
    if (category) url += `category=${category}&`;
    if (featured) url += `featured=${featured}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (sort) url += `sort=${sort}&`;

    const response = await apiClient.get(url);
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
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await apiClient.get(
      `/api/products?featured=true&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get related products
 * @param {string} productId - Product ID to find related products for
 * @param {number} limit - Number of products to return
 * @returns {Promise} Promise with related products data
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const response = await apiClient.get(
      `/api/products/${productId}/related?limit=${limit}`
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
  getRelatedProducts,
};

export default productsService;
