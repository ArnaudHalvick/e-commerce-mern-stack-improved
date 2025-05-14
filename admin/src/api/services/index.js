// Export services for easier imports
import authService from "./authService";
import * as products from "./products";

export { authService as auth, products };

export default {
  auth: authService,
  products,
};
