/**
 * Authentication Service
 * Handles login, logout, token management
 */

import apiClient from "../client";
import { AUTH_ENDPOINTS } from "../config";

/**
 * Login as admin
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Admin email
 * @param {string} credentials.password - Admin password
 * @returns {Promise<Object>} Auth data with tokens
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);

    if (response.data.accessToken) {
      // Store access token in localStorage
      localStorage.setItem("admin-auth-token", response.data.accessToken);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout admin user
 * @returns {Promise<Object>} Logout result
 */
export const logout = async () => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);

    // Always clear local storage on logout
    localStorage.removeItem("admin-auth-token");

    return response.data;
  } catch (error) {
    // Still clear tokens even if the server call fails
    localStorage.removeItem("admin-auth-token");
    console.error("Logout error:", error);
    throw error;
  }
};

/**
 * Verify if admin user is authenticated
 * @returns {Promise<Object>} User data
 */
export const verifyAuth = async () => {
  try {
    const response = await apiClient.get(AUTH_ENDPOINTS.VERIFY);
    return response.data;
  } catch (error) {
    console.error("Auth verification error:", error);
    throw error;
  }
};

/**
 * Refresh access token
 * @returns {Promise<Object>} New access token
 */
export const refreshToken = async () => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN);

    if (response.data.accessToken) {
      localStorage.setItem("admin-auth-token", response.data.accessToken);
    }

    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

/**
 * Get current auth status
 * @returns {boolean} True if user has auth token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("admin-auth-token");
};

export default {
  login,
  logout,
  verifyAuth,
  refreshToken,
  isAuthenticated,
};
