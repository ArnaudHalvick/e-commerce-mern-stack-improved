/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

import apiClient from "../client";

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with auth token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("auth-token");
  return {
    "Content-Type": "application/json",
    "auth-token": token,
  };
};

/**
 * Login a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Promise with login response
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient.post("/api/users/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Promise with registration response
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post("/api/users/signup", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get currently logged in user's profile
 * @returns {Promise} Promise with user profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/users/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise} Promise with updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const response = await apiClient.put("/api/users/profile", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Old and new password data
 * @returns {Promise} Promise with password change response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post(
      "/api/users/change-password",
      passwordData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Promise with password reset request response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/api/users/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Promise} Promise with password reset response
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.post(`/api/users/reset-password`, {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Request email verification
 * @param {string} email - User email
 * @returns {Promise} Promise with email verification request response
 */
export const requestEmailVerification = async (email) => {
  try {
    const response = await apiClient.post("/api/users/request-verification", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise} Promise with email verification response
 */
export const verifyEmail = async (token) => {
  try {
    const response = await apiClient.get(`/api/users/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh access token
 * @returns {Promise} Promise with new access token
 */
export const refreshToken = async () => {
  try {
    const response = await apiClient.post("/api/users/refresh-token");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} Promise with logout response
 */
export const logout = async () => {
  try {
    const response = await apiClient.post("/api/users/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as auth service
const authService = {
  getAuthHeaders,
  login,
  register,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  refreshToken,
  logout,
};

export default authService;
