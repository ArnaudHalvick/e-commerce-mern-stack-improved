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

// Public API endpoints that don't require authentication
const publicEndpoints = [
  "/api/users/login",
  "/api/users/signup",
  "/api/users/forgot-password",
  "/api/users/reset-password",
  "/api/users/request-verification",
  "/api/users/verify-email",
  "/api/validation/password-reset",
  "/api/validation/registration",
];

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    // If user is logged out, avoid authenticated requests
    if (isUserLoggedOut() && !isPublicEndpoint) {
      const error = new Error("User is logged out");
      error.config = config;
      error.isLoggedOutError = true; // Add a flag to identify this type of error
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

    // Special case for logged out errors
    if (error.isLoggedOutError) {
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
      status: 500, // Default status
      originalError: error,
    };

    // Server responded with an error
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
      }

      // Add url context for specific error handling in formatApiError
      if (error.config && error.config.url) {
        errorResponse.config = {
          url: error.config.url,
          method: error.config.method,
        };
      }

      // If the error was due to an expired token, try to refresh it
      if (
        error.response.status === 401 &&
        error.config &&
        !error.config._retry &&
        !isRefreshing &&
        !isUserLoggedOut()
      ) {
        if (isRefreshing) {
          // If already refreshing, add this request to the queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              error.config.headers["auth-token"] = token;
              return apiClient(error.config);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
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

            // Process any queued requests with the new token
            processQueue(null, newToken);

            return apiClient(error.config);
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

// Add event listener for logout events
if (typeof window !== "undefined") {
  window.addEventListener("user:logout", () => {
    cancelPendingRequests("User initiated logout");
    console.log("Canceled all pending API requests due to logout");
  });
}

export default apiClient;
