import axios from "axios";
import { API_BASE_URL } from "./imageUtils";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
    // Extract error details
    const errorResponse = {
      message: "An unexpected error occurred",
      status: error.response?.status || 500,
      data: error.response?.data || {},
    };

    // Handle specific HTTP status codes
    switch (errorResponse.status) {
      case 400:
        errorResponse.message = errorResponse.data.message || "Invalid request";
        break;
      case 401:
        errorResponse.message = "Your session has expired. Please log in again";
        // Could trigger a logout or redirect to login
        // store.dispatch(logout());
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
