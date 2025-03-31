/**
 * Payments API service
 * Handles all payment-related API calls
 */

import apiClient from "../client";

/**
 * Get cart summary without creating payment intent
 * @returns {Promise} Promise with cart summary data
 */
export const getCartSummary = async () => {
  try {
    const response = await apiClient.get("/api/payment/cart-summary");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Initialize payment intent
 * @param {Object} shippingAddress - The shipping address
 * @param {string} shippingMethod - The shipping method
 * @returns {Promise} Promise with client secret and payment intent ID
 */
export const createPaymentIntent = async (
  shippingAddress,
  shippingMethod = "standard"
) => {
  try {
    const response = await apiClient.post(
      "/api/payment/create-payment-intent",
      {
        shippingAddress,
        shippingMethod,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm order after payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise} Promise with order confirmation data
 */
export const confirmOrder = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await apiClient.post("/api/payment/confirm-order", {
      paymentIntentId,
      paymentMethodId,
    });
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
 * Get all orders for the logged in user
 * @returns {Promise} Promise with user's orders
 */
export const getMyOrders = async () => {
  try {
    const response = await apiClient.get("/api/payment/my-orders");
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
    const response = await apiClient.get(`/api/payment/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as payments service
const paymentsService = {
  getCartSummary,
  createPaymentIntent,
  confirmOrder,
  getSavedPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  getMyOrders,
  getOrderDetails,
};

export default paymentsService;
