/**
 * Admin Products API Service
 * Handles all product management API calls
 */

import apiClient from "../client";

/**
 * Get all products for admin panel
 * @param {Object} options - Filter options
 * @param {boolean} options.includeDeleted - Whether to include deleted products
 * @param {boolean} options.onlyDeleted - Whether to only show deleted products
 * @returns {Promise} Promise with all products data
 */
const getAllProducts = async (options = {}) => {
  const params = {};

  if (options.includeDeleted) {
    params.includeDeleted = "true";
  }

  if (options.onlyDeleted) {
    params.onlyDeleted = "true";
  }

  const response = await apiClient.get("/api/admin/products", { params });
  return response.data;
};

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} Promise with product data
 */
const getProductById = async (productId) => {
  const response = await apiClient.get(`/api/admin/products/${productId}`);
  return response.data;
};

/**
 * Get a single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise} Promise with product data
 */
const getProductBySlug = async (slug) => {
  const response = await apiClient.get(`/api/admin/products/slug/${slug}`);
  return response.data;
};

/**
 * Create a new product
 * @param {Object} productData - Product information
 * @returns {Promise} Promise with created product data
 */
const createProduct = async (productData) => {
  try {
    const response = await apiClient.post("/api/admin/products", productData);
    return response.data;
  } catch (error) {
    // Enhance error message with form data information
    const enhancedError = new Error(
      error.message || "Failed to create product"
    );
    enhancedError.status = error.response?.status || 500;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

/**
 * Update an existing product
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product information
 * @returns {Promise} Promise with updated product data
 */
const updateProduct = async (productId, productData) => {
  const response = await apiClient.put(
    `/api/admin/products/${productId}`,
    productData
  );

  // If response doesn't contain complete product data, merge with the sent data
  if (response.data && !response.data.name && productData.name) {
    return { ...productData, ...response.data };
  }

  return response.data;
};

/**
 * Soft delete a product (mark as deleted)
 * @param {string} productId - Product ID
 * @returns {Promise} Promise with deletion status
 */
const deleteProduct = async (productId) => {
  const response = await apiClient.delete(`/api/admin/products/${productId}`);
  return response.data;
};

/**
 * Permanently delete a product (use with caution)
 * @param {string} productId - Product ID
 * @returns {Promise} Promise with deletion status
 */
const permanentDeleteProduct = async (productId) => {
  const response = await apiClient.delete(
    `/api/admin/products/${productId}/permanent`
  );
  return response.data;
};

/**
 * Restore a deleted product
 * @param {string} productId - Product ID
 * @returns {Promise} Promise with restore status
 */
const restoreProduct = async (productId) => {
  const response = await apiClient.post(
    `/api/admin/products/${productId}/restore`
  );
  return response.data;
};

/**
 * Toggle product availability or set to specific value
 * @param {string} productId - Product ID
 * @param {boolean} [available] - Optional availability value (if not provided, availability will be toggled)
 * @returns {Promise} Promise with the updated product
 */
const toggleAvailability = async (productId, available) => {
  const payload = {};
  if (available !== undefined) {
    payload.available = available;
  }

  const response = await apiClient.patch(
    `/api/admin/products/${productId}/toggle-availability`,
    payload
  );
  return response.data;
};

/**
 * Upload product images
 * @param {FileList} imageFiles - Image files to upload
 * @returns {Promise} Promise with uploaded image paths
 */
const uploadProductImages = async (imageFiles) => {
  const formData = new FormData();

  // Append each file to the form data
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append("images", imageFiles[i]);
  }

  // Use multipart/form-data for file uploads
  const response = await apiClient.post(
    "/api/admin/products/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Delete uploaded images that were not saved with a product
 * @param {string[]} imagePaths - Array of image paths to delete
 * @returns {Promise} Promise with deletion status
 */
const deleteUploadedImages = async (imagePaths) => {
  const response = await apiClient.delete("/api/admin/products/images", {
    data: { imagePaths },
  });
  return response.data;
};

/**
 * Get all uploaded images
 * @returns {Promise} Promise with all available images
 */
const getAllUploadedImages = async () => {
  const response = await apiClient.get("/api/admin/products/images");
  return response.data;
};

/**
 * Checks if a product exists by a specific field (like name or slug)
 * @param {string} field - Field to check (e.g., "name", "slug")
 * @param {string} value - Value to check for
 * @returns {Promise<boolean>} True if product exists, false otherwise
 */
const checkProductExists = async (field, value) => {
  try {
    const response = await apiClient.get(
      `/api/admin/products?${field}=${encodeURIComponent(value)}`
    );
    return response.data.count > 0;
  } catch {
    // Ignore specific error and return false
    return false;
  }
};

// Export service methods
const productsService = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  permanentDeleteProduct,
  restoreProduct,
  toggleAvailability,
  uploadProductImages,
  deleteUploadedImages,
  checkProductExists,
  getAllUploadedImages,
};

export default productsService;
