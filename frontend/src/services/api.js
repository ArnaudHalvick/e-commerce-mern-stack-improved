// Path: frontend/src/services/api.js
// This file is maintained for backward compatibility
// It exports all services from the refactored structure

import authApi from "./authApi";
import reviewsApi from "./reviewsApi";
import productsApi from "./productsApi";
import cartApi from "./cartApi";

// Re-export for backward compatibility
export { authApi, reviewsApi, productsApi, cartApi };

// Export default for convenience
const apiServices = {
  authApi,
  reviewsApi,
  productsApi,
  cartApi,
};

export default apiServices;
