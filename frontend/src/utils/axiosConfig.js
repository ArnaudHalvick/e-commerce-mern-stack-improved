// frontend/src/utils/axiosConfig.js

import axios from "axios";
import { API_BASE_URL } from "./apiUtils";

// Create axios instance with default config
const api = axios.create({
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

// Public routes that don't require authentication
const publicRoutes = [
  "/api/users/login",
  "/api/users/signup",
  "/api/error-demo", // Error demo routes don't require authentication
];

// Function to check if user is logged out
const isUserLoggedOut = () =>
  localStorage.getItem("user-logged-out") === "true";

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

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Check if the current URL is a public route that doesn't need authentication
    const isPublicRoute = publicRoutes.some((route) =>
      config.url.startsWith(route)
    );

    // If user is logged out and not accessing a public route, reject the request
    if (isUserLoggedOut() && !isPublicRoute) {
      const error = new Error("User is logged out");
      error.config = config;
      return Promise.reject(error);
    }

    // Get token from local storage and add to headers if available
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers["auth-token"] = token;
    }

    // Add cancel token to non-auth requests
    if (
      !config.url.includes("/api/users/login") &&
      !config.url.includes("/api/users/signup") &&
      !config.url.includes("/api/users/refresh-token")
    ) {
      config.cancelToken = cancelTokenSource.token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If request was canceled, simply reject
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const errorResponse = {
      message: error.response?.data?.message || "An unexpected error occurred",
      status: error.response?.status || 500,
      data: error.response?.data || {},
    };

    // Check if this is a token expiration error
    const isTokenExpiredError =
      error.response?.status === 401 &&
      (error.response?.data?.message === "Token has expired" ||
        error.response?.data?.message === "Invalid token" ||
        error.response?.data?.message?.toLowerCase().includes("expired"));

    // Attempt token refresh if error is 401 (or token expired) and not already retried
    if (
      (error.response?.status === 401 || isTokenExpiredError) &&
      !originalRequest._retry &&
      !isUserLoggedOut() &&
      !originalRequest.url?.includes("refresh-token")
    ) {
      if (isRefreshing) {
        // Queue the request if a refresh is already in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["auth-token"] = token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
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
          originalRequest.headers["auth-token"] = newToken;

          // Process queued requests
          processQueue(null, newToken);
          return api(originalRequest);
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
    } else {
      // For non-auth related errors, use fallback messages if not provided by the server
      if (!errorResponse.message) {
        switch (errorResponse.status) {
          case 400:
            errorResponse.message = "Invalid request";
            break;
          case 401:
            errorResponse.message =
              "Your session has expired. Please log in again";
            break;
          case 403:
            errorResponse.message =
              "You do not have permission to access this resource";
            break;
          case 404:
            errorResponse.message = "The requested resource was not found";
            break;
          case 422:
            errorResponse.message = "Validation error";
            break;
          case 429:
            errorResponse.message = "Too many requests. Please try again later";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorResponse.message = "Server error. Please try again later";
            break;
          default:
            errorResponse.message = "An unexpected error occurred";
        }
      }
    }

    console.error("API Error:", errorResponse);
    return Promise.reject(errorResponse);
  }
);

// Function to cancel pending requests (used during logout)
export const cancelPendingRequests = (
  message = "Operation canceled due to logout"
) => {
  cancelTokenSource.cancel(message);
};

export default api;
