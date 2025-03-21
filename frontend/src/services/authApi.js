import apiClient from "./apiClient";

/**
 * Auth API service for handling user authentication operations
 */
const authApi = {
  /**
   * Register a new user
   * @param {object} userData - User data for registration
   * @returns {Promise} - Promise that resolves to registration response
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post("/api/users/signup", userData);
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise that resolves to login response
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/api/users/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} - Promise that resolves to logout response
   */
  logout: async () => {
    try {
      const response = await apiClient.get("/api/users/logout");
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Get the current user's profile
   * @returns {Promise} - Promise that resolves to user profile data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get("/api/users/me");
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Update the current user's profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise} - Promise that resolves to updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/api/users/profile", profileData);
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Change the current user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise that resolves to password change response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put("/api/users/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Disable the current user's account
   * @returns {Promise} - Promise that resolves to account disabling response
   */
  disableAccount: async () => {
    try {
      const response = await apiClient.put("/api/users/disable-account");
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Request email verification
   * @param {string} email - Email to verify
   * @returns {Promise} - Promise that resolves to verification request response
   */
  requestVerification: async (email) => {
    try {
      const response = await apiClient.post("/api/users/request-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} - Promise that resolves to verification response
   */
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.get(
        `/api/users/verify-email?token=${token}`
      );
      return response.data;
    } catch (error) {
      // Let the error interceptor handle formatting, just rethrow
      throw error;
    }
  },
};

export default authApi;
