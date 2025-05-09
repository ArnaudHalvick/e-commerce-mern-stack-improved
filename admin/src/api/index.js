/**
 * Admin API Exports
 * Central file to export all API services and configuration
 */

import apiClient from "./client";
import * as config from "./config";
import productsService from "./services/products";
import authService from "./services/auth";

// Export individual services for direct importing
export { apiClient, config, productsService, authService };

// Export default as a single API object
const api = {
  client: apiClient,
  config,
  products: productsService,
  auth: authService,
};

export default api;
