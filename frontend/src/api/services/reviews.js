/**
 * Reviews API service
 * Handles all review-related API calls
 */

import apiClient from "../client";

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} options - Query options (limit, page, sort)
 * @returns {Promise} Promise with reviews data
 */
export const getProductReviews = async (productId, options = {}) => {
  try {
    const { limit = 10, page = 1, sort = "newest" } = options;
    const response = await apiClient.get(
      `/api/products/${productId}/reviews?limit=${limit}&page=${page}&sort=${sort}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new review for a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data (rating, comment, title)
 * @returns {Promise} Promise with created review data
 */
export const createReview = async (productId, reviewData) => {
  try {
    const response = await apiClient.post(
      `/api/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data (rating, comment, title)
 * @returns {Promise} Promise with updated review data
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiClient.put(
      `/api/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise} Promise with deletion status
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's reviews
 * @param {Object} options - Query options (limit, page, sort)
 * @returns {Promise} Promise with user's reviews data
 */
export const getUserReviews = async (options = {}) => {
  try {
    const { limit = 10, page = 1, sort = "newest" } = options;
    const response = await apiClient.get(
      `/api/users/reviews?limit=${limit}&page=${page}&sort=${sort}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if user has purchased product (required for reviews)
 * @param {string} productId - Product ID
 * @returns {Promise} Promise with eligibility status
 */
export const checkReviewEligibility = async (productId) => {
  try {
    const response = await apiClient.get(
      `/api/products/${productId}/review-eligibility`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise} Promise with review data
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await apiClient.get(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as reviews service
const reviewsService = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  checkReviewEligibility,
  getReviewById,
};

export default reviewsService;
