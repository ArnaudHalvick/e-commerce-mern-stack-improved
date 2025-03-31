/**
 * Central API exports
 * This file exports all API services and the API client for use throughout the application
 */

import apiClient from "./client";
import * as config from "./config";

// Import services
import authService from "./services/auth";
import productsService from "./services/products";
import reviewsService from "./services/reviews";
import cartService from "./services/cart";
import paymentsService from "./services/payments";

// Export individual services for direct importing
export {
  apiClient,
  authService,
  productsService,
  reviewsService,
  cartService,
  paymentsService,
  config,
};

// Export default as a single API object for convenience
const api = {
  client: apiClient,
  auth: authService,
  products: productsService,
  reviews: reviewsService,
  cart: cartService,
  payments: paymentsService,
  config,
};

export default api;
