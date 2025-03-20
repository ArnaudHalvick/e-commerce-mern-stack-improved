import axios from "axios";

// Base URL for API requests - you can modify this to read from env vars
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Reusable axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
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

      // Special handling for auth errors
      if (error.response.status === 401) {
        // Clear auth data if needed
        // Could be handled by the consumer of this error
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
