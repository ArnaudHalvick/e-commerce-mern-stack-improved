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
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers["auth-token"] = token;
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
    const originalRequest = error.config;

    // Extract useful error information
    const errorResponse = {
      message: "An unexpected error occurred",
      status: 500,
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
      if (error.response.status === 401 && !originalRequest._retry) {
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

            return apiClient(originalRequest);
          } else {
            // If refresh fails, process queue with error
            processQueue(new Error("Refresh token failed"));
            localStorage.removeItem("auth-token");
          }
        } catch (refreshError) {
          // If refresh request throws, process queue with error
          processQueue(refreshError);
          localStorage.removeItem("auth-token");
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

    // Add original error for debugging
    errorResponse.originalError = error;

    // Log the error for debugging in non-production environments
    if (process.env.NODE_ENV !== "production") {
      console.error("API Error:", errorResponse);
    }

    return Promise.reject(errorResponse);
  }
);

export default apiClient;
