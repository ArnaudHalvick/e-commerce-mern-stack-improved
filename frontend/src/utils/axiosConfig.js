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
    // Get token from local storage
    const token = localStorage.getItem("auth-token");

    // If token exists, add to headers
    if (token) {
      config.headers["auth-token"] = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Extract error details
    const errorResponse = {
      message: "An unexpected error occurred",
      status: error.response?.status || 500,
      data: error.response?.data || {},
    };

    // Check if this is a token expiration error
    const isTokenExpiredError =
      error.response?.status === 401 &&
      (error.response?.data?.message === "Token has expired" ||
        error.response?.data?.message === "Invalid token" ||
        error.response?.data?.message?.toLowerCase().includes("expired"));

    // If the error is 401 Unauthorized and it's not a retry, attempt to refresh the token
    if (
      (error.response?.status === 401 || isTokenExpiredError) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["auth-token"] = token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data && response.data.success) {
          const newToken = response.data.accessToken;
          localStorage.setItem("auth-token", newToken);

          // Update the auth header for the original request
          originalRequest.headers["auth-token"] = newToken;

          // Process any queued requests with the new token
          processQueue(null, newToken);

          return api(originalRequest);
        } else {
          // If refresh fails, process queue with error
          processQueue(new Error("Refresh token failed"));
          localStorage.removeItem("auth-token");

          // Trigger redirect to login if needed (using event or other mechanism)
          if (typeof window !== "undefined") {
            // Create and dispatch a custom event that AuthContext can listen for
            const event = new CustomEvent("auth:tokenRefreshFailed");
            window.dispatchEvent(event);
          }

          return Promise.reject(errorResponse);
        }
      } catch (refreshError) {
        // If refresh request throws, process queue with error
        processQueue(refreshError);
        localStorage.removeItem("auth-token");

        // Trigger redirect to login if needed
        if (typeof window !== "undefined") {
          const event = new CustomEvent("auth:tokenRefreshFailed");
          window.dispatchEvent(event);
        }

        return Promise.reject(errorResponse);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle specific HTTP status codes
    switch (errorResponse.status) {
      case 400:
        errorResponse.message = errorResponse.data.message || "Invalid request";
        break;
      case 401:
        errorResponse.message = "Your session has expired. Please log in again";
        break;
      case 403:
        errorResponse.message =
          "You do not have permission to access this resource";
        break;
      case 404:
        errorResponse.message = "The requested resource was not found";
        break;
      case 422:
        errorResponse.message =
          errorResponse.data.message || "Validation error";
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
        errorResponse.message =
          errorResponse.data.message || "An unexpected error occurred";
    }

    // You can log errors to a service here
    console.error("API Error:", errorResponse);

    // Return a rejected promise with the enhanced error
    return Promise.reject(errorResponse);
  }
);

export default api;
