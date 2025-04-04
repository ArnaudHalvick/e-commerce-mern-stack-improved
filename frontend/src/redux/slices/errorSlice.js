import { createSlice } from "@reduxjs/toolkit";

// Generate a unique toast ID
let uniqueToastId = 0;
const generateUniqueId = () => {
  const timestamp = Date.now();
  uniqueToastId++;
  return `${timestamp}-${uniqueToastId}`;
};

// Initial state
const initialState = {
  toasts: [],
  globalError: null,
};

// Create the error slice
const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    // Add a toast notification
    addToast: (state, action) => {
      const { message, type = "error", duration = 5000 } = action.payload;
      const id = generateUniqueId();
      state.toasts.push({ id, message, type, duration });
      return state;
    },

    // Remove a toast notification
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
      return state;
    },

    // Set global error
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
      return state;
    },

    // Clear global error
    clearGlobalError: (state) => {
      state.globalError = null;
      return state;
    },

    // Clear all toasts
    clearAllToasts: (state) => {
      state.toasts = [];
      return state;
    },
  },
  // We'll add extraReducers here to catch errors from other async actions
  extraReducers: (builder) => {
    builder
      // Match any action that ends with 'rejected' (async thunk error)
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          // Only add a toast if there's an error message
          if (action.payload) {
            const errorMessage =
              typeof action.payload === "string"
                ? action.payload
                : action.payload.message || "An error occurred";

            const id = generateUniqueId();
            state.toasts.push({
              id,
              message: errorMessage,
              type: "error",
              duration: 5000,
            });
          }
        }
      );
  },
});

// Export actions
export const {
  addToast,
  removeToast,
  setGlobalError,
  clearGlobalError,
  clearAllToasts,
} = errorSlice.actions;

// Create convenience actions for different toast types
export const showError = (message, duration = 5000) => {
  return addToast({ message, type: "error", duration });
};

export const showSuccess = (message, duration = 3000) => {
  return addToast({ message, type: "success", duration });
};

export const showWarning = (message, duration = 4000) => {
  return addToast({ message, type: "warning", duration });
};

export const showInfo = (message, duration = 3000) => {
  return addToast({ message, type: "info", duration });
};

export default errorSlice.reducer;
