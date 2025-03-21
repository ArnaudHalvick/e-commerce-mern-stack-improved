import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

// Reusable axios instance with common configuration
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
    // If user is logged out, avoid authenticated requests
    if (
      isUserLoggedOut() &&
      config.url !== "/api/users/login" &&
      config.url !== "/api/users/signup"
    ) {
      const error = new Error("User is logged out");
      error.config = config;
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
      !config.url.includes("/api/users/refresh-token")
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
    // If request was canceled, just return the rejected promise
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Extract useful error information
    const errorResponse = {
      message: "An unexpected error occurred",
      status: 500,
      originalError: error,
    };

    // Handle specific error scenarios
    if (error.response) {
      // The server responded with a status code outside of 2xx range
      errorResponse.status = error.response.status;

      // Extract error message from the backend response format
      errorResponse.message =
        error.response.data?.message ||
        error.response.data?.error ||
        `${error.response.status} - ${error.response.statusText}`;

      // Special handling for auth errors - try to refresh token on 401
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !isUserLoggedOut() &&
        !originalRequest.url?.includes("refresh-token")
      ) {
        if (isRefreshing) {
          // If already refreshing, add this request to the queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["auth-token"] = token;
              return apiClient(originalRequest);
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
            `${API_BASE_URL}/api/users/refresh-token`,
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

            return apiClient(originalRequest);
          } else {
            // If refresh fails, process queue with error
            processQueue(new Error("Refresh token failed"));
            localStorage.removeItem("auth-token");
            localStorage.setItem("user-logged-out", "true");

            // Dispatch custom event for logout
            if (typeof window !== "undefined") {
              const event = new CustomEvent("auth:tokenRefreshFailed");
              window.dispatchEvent(event);
            }
          }
        } catch (refreshError) {
          // If refresh request throws, process queue with error
          processQueue(refreshError);
          localStorage.removeItem("auth-token");
          localStorage.setItem("user-logged-out", "true");

          // Dispatch custom event for logout
          if (typeof window !== "undefined") {
            const event = new CustomEvent("auth:tokenRefreshFailed");
            window.dispatchEvent(event);
          }
        } finally {
          isRefreshing = false;
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorResponse.message = "Network error. Please check your connection.";
      errorResponse.status = 0;
    } else {
      // Something else happened while setting up the request
      errorResponse.message = error.message;
    }

    // You can log errors to a monitoring service here
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

export default apiClient;
