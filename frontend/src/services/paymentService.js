import axios from "axios";
import { getAuthHeaders } from "./authService"; // Assuming you have an auth service

// Fix the API URL - don't append /api in the middle, it should be at the end of your base URL
const API_URL = `${process.env.REACT_APP_API_URL}api`;

/**
 * Create a payment intent with the current cart and shipping info
 * @param {Object} shippingInfo - Shipping information
 * @returns {Promise<Object>} - Payment intent details including client secret
 */
export const createPaymentIntent = async (shippingInfo) => {
  try {
    const response = await axios.post(
      `${API_URL}/payment/create-payment-intent`,
      { shippingInfo },
      { headers: await getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Confirm order after payment is processed
 * @param {string} paymentIntentId - The ID of the successful payment intent
 * @param {Object} shippingInfo - Shipping information
 * @returns {Promise<Object>} - Order details
 */
export const confirmOrder = async (paymentIntentId, shippingInfo) => {
  try {
    const response = await axios.post(
      `${API_URL}/payment/confirm-order`,
      { paymentIntentId, shippingInfo },
      { headers: await getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
};

/**
 * Get all orders for the current user
 * @returns {Promise<Object>} - List of orders
 */
export const getMyOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/payment/my-orders`, {
      headers: await getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise<Object>} - Order details
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/payment/order/${orderId}`, {
      headers: await getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};
