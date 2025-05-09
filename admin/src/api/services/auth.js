/**
 * Admin Authentication API Service
 * Handles user authentication for the admin panel
 */

import apiClient from "../client";

/**
 * Log in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Promise with login data
 */
const login = async (email, password) => {
  const response = await apiClient.post("/api/users/login", {
    email,
    password,
  });

  if (response.data && response.data.token) {
    localStorage.setItem("admin-auth-token", response.data.token);
  }

  return response.data;
};

/**
 * Log out the current user
 * @returns {Promise} Promise with logout status
 */
const logout = async () => {
  try {
    // Call logout endpoint if it exists
    await apiClient.post("/api/users/logout");
  } catch {
    // Ignore errors during logout
  } finally {
    // Always clear local storage
    localStorage.removeItem("admin-auth-token");
  }

  return { success: true };
};

/**
 * Get the current authenticated user
 * @returns {Promise} Promise with user data
 */
const getCurrentUser = async () => {
  const response = await apiClient.get("/api/users/me");
  return response.data;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
const isAuthenticated = () => {
  return !!localStorage.getItem("admin-auth-token");
};

const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
};

export default authService;
