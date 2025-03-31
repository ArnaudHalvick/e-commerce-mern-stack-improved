/**
 * Payments API service
 * Handles all payment-related API calls
 */

import apiClient from "../client";

/**
 * Initialize payment intent
 * @returns {Promise} Promise with client secret and payment intent ID
 */
export const createPaymentIntent = async () => {
  try {
    const response = await apiClient.post(
      "/api/payments/create-payment-intent"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment methods saved for the user
 * @returns {Promise} Promise with saved payment methods
 */
export const getSavedPaymentMethods = async () => {
  try {
    const response = await apiClient.get("/api/payments/payment-methods");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save a new payment method
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise} Promise with saved payment method data
 */
export const savePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await apiClient.post("/api/payments/payment-methods", {
      paymentMethodId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a saved payment method
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise} Promise with deletion status
 */
export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await apiClient.delete(
      `/api/payments/payment-methods/${paymentMethodId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Complete payment after successful Stripe confirmation
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {Object} orderDetails - Additional order details
 * @returns {Promise} Promise with order confirmation data
 */
export const completePayment = async (paymentIntentId, orderDetails = {}) => {
  try {
    const response = await apiClient.post("/api/payments/complete", {
      paymentIntentId,
      ...orderDetails,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get order details by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Promise with order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's order history
 * @param {Object} options - Query options (limit, page, sort)
 * @returns {Promise} Promise with orders history
 */
export const getOrderHistory = async (options = {}) => {
  try {
    const { limit = 10, page = 1, sort = "newest" } = options;
    const response = await apiClient.get(
      `/api/orders?limit=${limit}&page=${page}&sort=${sort}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Promise with cancellation status
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await apiClient.post(`/api/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as payments service
const paymentsService = {
  createPaymentIntent,
  getSavedPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  completePayment,
  getOrderDetails,
  getOrderHistory,
  cancelOrder,
};

export default paymentsService;
