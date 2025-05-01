/**
 * Centralized API client for the application
 * This file consolidates the functionality from services/apiClient.js and utils/axiosConfig.js
 */

import axios from "axios";
import { API_BASE_URL } from "./config";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 seconds timeout for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue = [];

// Use a ref to store the cancel token source so we can replace it after cancellation
let cancelTokenSource = axios.CancelToken.source();

/**
 * Cancel all pending requests
 * @param {string} message - Reason for cancellation
 */
export const cancelPendingRequests = (message = "Operation canceled") => {
  // Cancel pending requests
  cancelTokenSource.cancel(message);
  // Create a new cancel token source for future requests
  cancelTokenSource = axios.CancelToken.source();
};

// Public API endpoints that don't require authentication
const publicEndpoints = [
  "/users/login",
  "/users/signup",
  "/users/forgot-password",
  "/users/reset-password",
  "/users/request-verification",
  "/users/verify-email",
  "/users/refresh-token",
  "/users/verify-token",
  "/error-demo",
  "/products",
  "/products/all-products",
  "/products/newcollection",
  "/products/featured-women",
  "/products/category",
  "/products/tag",
  "/products/type",
  "/products/related",
];

// Function to check if user is logged out
const isUserLoggedOut = () => {
  return (
    localStorage.getItem("user-logged-out") === "true" &&
    !localStorage.getItem("auth-token")
  );
};

// Function to process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to ensure URL starts with /api
const ensureApiPrefix = (url) => {
  if (!url.startsWith("/api/") && !url.startsWith("api/")) {
    return `/api${url.startsWith("/") ? url : `/${url}`}`;
  }
  return url;
};

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Make sure all URLs have /api prefix
    if (config.url) {
      config.url = ensureApiPrefix(config.url);
    }

    // Check if this is a public endpoint that doesn't require authentication
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    // If user is logged out and not accessing a public endpoint, reject the request
    if (isUserLoggedOut() && !isPublicEndpoint) {
      const error = new Error("User is logged out");
      error.config = config;
      error.isLoggedOutError = true; // Flag this type of error
      return Promise.reject(error);
    }

    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers["auth-token"] = token;
      // If we have a token, make sure we're not marked as logged out
      if (localStorage.getItem("user-logged-out") === "true") {
        localStorage.removeItem("user-logged-out");
      }
    }

    // Add cancel token to non-auth requests
    if (
      !config.url.includes("/users/login") &&
      !config.url.includes("/users/signup") &&
      !config.url.includes("/users/refresh-token") &&
      !config.url.includes("/users/forgot-password") &&
      !config.url.includes("/users/reset-password")
    ) {
      config.cancelToken = cancelTokenSource.token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error scenarios
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If request was canceled, simply return the rejected promise
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Handle timeout errors with a user-friendly message
    if (
      error.code === "ECONNABORTED" &&
      error.message &&
      error.message.includes("timeout")
    ) {
      return Promise.reject({
        message:
          "Request timed out. Please check your internet connection and try again.",
        status: 408, // Request Timeout
        originalError: error,
        isTimeout: true,
      });
    }

    // Handle network errors (e.g., no internet connection)
    if (error.message === "Network Error") {
      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
        status: 0,
        originalError: error,
        isNetworkError: true,
      });
    }

    // Special case for logged out errors
    if (error.isLoggedOutError) {
      // Check if this is a password recovery related endpoint
      if (
        error.config &&
        (error.config.url.includes("/users/forgot-password") ||
          error.config.url.includes("/users/reset-password"))
      ) {
        // Allow password recovery to proceed even when logged out
        return Promise.reject({
          message: "Enter your email to receive recovery instructions",
          status: 401,
          originalError: error,
          isPasswordRecovery: true,
        });
      }

      return Promise.reject({
        message: "User is logged out",
        status: 401,
        originalError: error,
        isLoggedOut: true,
      });
    }

    // Default error response structure
    const errorResponse = {
      message: "An unexpected error occurred",
      status: 500,
      originalError: error,
    };

    if (error.response) {
      errorResponse.status = error.response.status;

      // Extract error message from response if available
      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorResponse.message = error.response.data || errorResponse.message;
        } else if (error.response.data.message) {
          errorResponse.message =
            error.response.data.message || errorResponse.message;
        } else if (error.response.data.error) {
          errorResponse.message =
            error.response.data.error || errorResponse.message;
        }

        // Extract validation errors if available
        if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          const fieldErrors = {};
          error.response.data.errors.forEach((err) => {
            fieldErrors[err.param] = err.msg;
          });
          if (Object.keys(fieldErrors).length > 0) {
            errorResponse.fieldErrors = fieldErrors;
          }
        }
      }

      // Handle token expiration: try to refresh the token
      if (
        error.response.status === 401 &&
        !error.config._retry &&
        !isUserLoggedOut() &&
        !error.config.url?.includes("/api/users/refresh-token")
      ) {
        if (isRefreshing) {
          // Queue the request if a refresh is already in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              error.config.headers["auth-token"] = token;
              return apiClient(error.config);
            })
            .catch((err) => Promise.reject(err));
        }

        error.config._retry = true;
        isRefreshing = true;

        try {
          // Call the refresh token endpoint
          const response = await axios.post(
            `${API_BASE_URL}/api/users/refresh-token`,
            {},
            { withCredentials: true }
          );

          if (response.data && response.data.success) {
            const newToken = response.data.accessToken;
            localStorage.setItem("auth-token", newToken);

            // Update the auth header for the original request
            error.config.headers["auth-token"] = newToken;

            // Process queued requests
            processQueue(null, newToken);
            return apiClient(error.config);
          } else {
            // If refresh fails, process queue with error and mark as logged out
            processQueue(new Error("Refresh token failed"));
            localStorage.removeItem("auth-token");
            localStorage.setItem("user-logged-out", "true");

            if (typeof window !== "undefined") {
              const event = new CustomEvent("auth:tokenRefreshFailed");
              window.dispatchEvent(event);
            }

            return Promise.reject(errorResponse);
          }
        } catch (refreshError) {
          processQueue(refreshError);
          localStorage.removeItem("auth-token");
          localStorage.setItem("user-logged-out", "true");

          if (typeof window !== "undefined") {
            const event = new CustomEvent("auth:tokenRefreshFailed");
            window.dispatchEvent(event);
          }

          return Promise.reject(errorResponse);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default apiClient;
