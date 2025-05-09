/**
 * Admin API Exports
 * Central file to export all API services and configuration
 */

import apiClient, { cancelPendingRequests } from "./client";
import * as config from "./config";
import productsService from "./services/products";
import authService from "./services/authService";

// Export individual services for direct importing
export {
  apiClient,
  cancelPendingRequests,
  config,
  productsService,
  authService,
};

// Export default as a single API object
const api = {
  client: apiClient,
  cancelPendingRequests,
  config,
  products: productsService,
  auth: authService,
};

export default api;
