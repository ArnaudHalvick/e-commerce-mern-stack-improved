import React, { useReducer } from "react";
import ErrorContext from "./ErrorContext";
import ErrorReducer from "./ErrorReducer";
import {
  ToastProvider,
  useToast,
} from "../../components/ui/errorHandling/toast/ToastProvider";
import {
  SET_ERROR,
  CLEAR_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_SUCCESS,
  CLEAR_SUCCESS,
} from "./ErrorTypes";

// Inner provider component that has access to toast context
const ErrorStateInner = ({ children }) => {
  const toast = useToast();

  const initialState = {
    error: null,
    loading: false,
    success: null,
  };

  const [state, dispatch] = useReducer(ErrorReducer, initialState);

  // Set error
  const setError = (message, details = null) => {
    dispatch({
      type: SET_ERROR,
      payload: { message, details },
    });

    if (message) {
      toast.showErrorToast(message);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  // Set loading
  const setLoading = (component = "global") => {
    dispatch({
      type: SET_LOADING,
      payload: component,
    });
  };

  // Clear loading
  const clearLoading = (component = "global") => {
    dispatch({
      type: CLEAR_LOADING,
      payload: component,
    });
  };

  // Set success
  const setSuccess = (message, data = null) => {
    dispatch({
      type: SET_SUCCESS,
      payload: { message, data },
    });

    if (message) {
      toast.showSuccessToast(message);
    }
  };

  // Clear success
  const clearSuccess = () => {
    dispatch({ type: CLEAR_SUCCESS });
  };

  // Handle API errors consistently
  const handleApiError = (error, customMessage = null) => {
    let errorMessage = customMessage || "An unexpected error occurred";
    let errorDetails = null;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        errorMessage;
      errorDetails = {
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your connection.";
      errorDetails = {
        request: error.request,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || errorMessage;
    }

    setError(errorMessage, errorDetails);
    return { error: true, message: errorMessage, details: errorDetails };
  };

  return (
    <ErrorContext.Provider
      value={{
        error: state.error,
        loading: state.loading,
        success: state.success,
        setError,
        clearError,
        setLoading,
        clearLoading,
        setSuccess,
        clearSuccess,
        handleApiError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

// Main provider that wraps the inner provider with ToastProvider
const ErrorState = ({ children }) => {
  return (
    <ToastProvider>
      <ErrorStateInner>{children}</ErrorStateInner>
    </ToastProvider>
  );
};

export default ErrorState;
