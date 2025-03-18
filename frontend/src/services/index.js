import authApi from "./authApi";
import reviewsApi from "./reviewsApi";
import productsApi from "./productsApi";
import cartApi from "./cartApi";
import apiClient from "./apiClient";

// Export individual APIs for direct importing
export { authApi, reviewsApi, productsApi, cartApi, apiClient };

// Export default for convenience
const apiServices = {
  authApi,
  reviewsApi,
  productsApi,
  cartApi,
};

export default apiServices;
