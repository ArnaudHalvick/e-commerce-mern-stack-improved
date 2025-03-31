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
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue = [];

// Create a cancel token source for requests that should be canceled on logout
const cancelTokenSource = axios.CancelToken.source();

/**
 * Cancel all pending requests
 * @param {string} message - Reason for cancellation
 */
export const cancelPendingRequests = (message = "Operation canceled") => {
  cancelTokenSource.cancel(message);
};

// Public API endpoints that don't require authentication
const publicEndpoints = [
  "/api/users/login",
  "/api/users/signup",
  "/api/users/forgot-password",
  "/api/users/reset-password",
  "/api/users/request-verification",
  "/api/users/verify-email",
  "/api/error-demo", // Error demo routes don't require authentication
];

// Function to check if user is logged out
const isUserLoggedOut = () => {
  return localStorage.getItem("user-logged-out") === "true";
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

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
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
    }

    // Add cancel token to non-auth requests
    if (
      !config.url.includes("/api/users/login") &&
      !config.url.includes("/api/users/signup") &&
      !config.url.includes("/api/users/refresh-token") &&
      !config.url.includes("/api/users/forgot-password") &&
      !config.url.includes("/api/users/reset-password")
    ) {
      config.cancelToken = cancelTokenSource.token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common error scenarios
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If request was canceled, simply return the rejected promise
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Special case for logged out errors
    if (error.isLoggedOutError) {
      // Check if this is a password recovery related endpoint
      if (
        error.config &&
        (error.config.url.includes("/api/users/forgot-password") ||
          error.config.url.includes("/api/users/reset-password"))
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
