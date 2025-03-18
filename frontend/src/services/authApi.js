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
      const response = await apiClient.post("/api/signup", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data || error.message || "Registration failed";
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
      const response = await apiClient.post("/api/login", { email, password });
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || error.message || "Login failed";
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} - Promise that resolves to logout response
   */
  logout: async () => {
    try {
      const response = await apiClient.get("/api/logout");
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error.response?.data || error.message || "Logout failed";
    }
  },

  /**
   * Get the current user's profile
   * @returns {Promise} - Promise that resolves to user profile data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get("/api/me");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error.response?.data || error.message || "Failed to get profile";
    }
  },

  /**
   * Update the current user's profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise} - Promise that resolves to updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/api/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || error.message || "Failed to update profile";
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
      const response = await apiClient.put("/api/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw (
        error.response?.data || error.message || "Failed to change password"
      );
    }
  },

  /**
   * Disable the current user's account
   * @returns {Promise} - Promise that resolves to account disabling response
   */
  disableAccount: async () => {
    try {
      const response = await apiClient.put("/api/disable-account");
      return response.data;
    } catch (error) {
      console.error("Disable account error:", error);
      throw (
        error.response?.data || error.message || "Failed to disable account"
      );
    }
  },

  /**
   * Request email verification
   * @param {string} email - Email to verify
   * @returns {Promise} - Promise that resolves to verification request response
   */
  requestVerification: async (email) => {
    try {
      const response = await apiClient.post("/api/request-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Verification request error:", error);
      throw (
        error.response?.data || error.message || "Verification request failed"
      );
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} - Promise that resolves to verification response
   */
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.get(`/api/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      throw (
        error.response?.data || error.message || "Email verification failed"
      );
    }
  },
};

export default authApi;
