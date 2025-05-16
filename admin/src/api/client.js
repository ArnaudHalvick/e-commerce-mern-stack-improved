/**
 * Admin API Client
 * Handles all API requests with authentication and error handling
 */

import axios from "axios";
import { API_BASE_URL, AUTH_ENDPOINTS } from "./config";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Check if we're in a Docker container using the environment variable
// Only for local development
const IS_LOCAL_DOCKER =
  import.meta.env.DEV && import.meta.env.VITE_IS_DOCKER === "true";

// Check if we're on the admin subdomain in production
const IS_ADMIN_SUBDOMAIN =
  typeof window !== "undefined" &&
  window.location.hostname.includes("admin.") &&
  !import.meta.env.DEV;

// Always use same-origin in browser to avoid CORS issues
// Except when explicitly in local Docker environment
const USE_SAME_ORIGIN = typeof window !== "undefined" && !IS_LOCAL_DOCKER;

// Track active requests for cancellation
let cancelTokenSource = axios.CancelToken.source();

/**
 * Cancel all pending requests
 */
export const cancelPendingRequests = (message = "Operation canceled") => {
  cancelTokenSource.cancel(message);
  cancelTokenSource = axios.CancelToken.source();
};

// Helper to ensure URL starts with /api if necessary
const ensureApiPrefix = (url) => {
  // Skip adding /api if the URL already includes the full path from the config
  if (
    url.includes(AUTH_ENDPOINTS.LOGIN) ||
    url.includes(AUTH_ENDPOINTS.LOGOUT) ||
    url.includes(AUTH_ENDPOINTS.VERIFY) ||
    url.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)
  ) {
    return url;
  }

  // Otherwise, ensure it has the /api prefix
  if (!url.startsWith("/api/") && !url.startsWith("api/")) {
    return `/api${url.startsWith("/") ? url : `/${url}`}`;
  }
  return url;
};

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Ensure URLs have proper prefix
    if (config.url) {
      config.url = ensureApiPrefix(config.url);

      // Use same-origin for API requests except in local Docker
      if (USE_SAME_ORIGIN) {
        // Override the baseURL to use same origin for all requests
        config.baseURL = window.location.origin;
      }
    }

    // Add authorization token if available
    const token = localStorage.getItem("admin-auth-token");
    if (token) {
      config.headers["auth-token"] = token;
    }

    // Add cancel token to most requests
    if (
      !config.url.includes(AUTH_ENDPOINTS.LOGIN) &&
      !config.url.includes(AUTH_ENDPOINTS.LOGOUT)
    ) {
      config.cancelToken = cancelTokenSource.token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle canceled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (
      error.code === "ECONNABORTED" &&
      error.message &&
      error.message.includes("timeout")
    ) {
      return Promise.reject({
        message:
          "Request timed out. Please check your internet connection and try again.",
        status: 408,
        originalError: error,
        isTimeout: true,
      });
    }

    // Handle network errors
    if (error.message === "Network Error") {
      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
        status: 0,
        originalError: error,
        isNetworkError: true,
      });
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem("admin-auth-token");

      // Redirect to login page if not already there
      if (!window.location.pathname.includes("/login")) {
        // In the admin panel context, we should redirect to /login
        // which will be handled by the router with the proper basename
        window.location.href = "/login";
      }

      return Promise.reject({
        message: "Your session has expired. Please log in again.",
        status: 401,
        originalError: error,
        isAuthError: true,
      });
    }

    // Handle server errors
    if (error.response && error.response.status >= 500) {
      return Promise.reject({
        message: "Server error. Please try again later.",
        status: error.response.status,
        originalError: error,
        isServerError: true,
      });
    }

    // Handle other errors
    if (error.response) {
      return Promise.reject({
        message: error.response.data.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
        originalError: error,
      });
    }

    // Default error handler
    return Promise.reject({
      message: error.message || "An unexpected error occurred",
      originalError: error,
    });
  }
);

export default apiClient;
