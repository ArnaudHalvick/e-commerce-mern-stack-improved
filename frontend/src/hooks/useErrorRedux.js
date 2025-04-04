import { useSelector, useDispatch } from "react-redux";
import {
  showError,
  showSuccess,
  showWarning,
  showInfo,
  removeToast,
  setGlobalError,
  clearGlobalError,
  clearAllToasts,
} from "../redux/slices/errorSlice";

/**
 * Custom hook to access and manage error state from Redux
 * This is the primary hook for error handling in the application.
 * @returns {Object} Error state and methods for managing errors and toasts
 */
const useErrorRedux = () => {
  const dispatch = useDispatch();
  const { toasts, globalError } = useSelector((state) => state.error);

  const handleShowError = (message, duration = 5000) => {
    dispatch(showError(message, duration));
  };

  const handleShowSuccess = (message, duration = 3000) => {
    dispatch(showSuccess(message, duration));
  };

  const handleShowWarning = (message, duration = 4000) => {
    dispatch(showWarning(message, duration));
  };

  const handleShowInfo = (message, duration = 3000) => {
    dispatch(showInfo(message, duration));
  };

  const handleRemoveToast = (id) => {
    dispatch(removeToast(id));
  };

  const handleSetGlobalError = (error) => {
    dispatch(setGlobalError(error));
  };

  const handleClearGlobalError = () => {
    dispatch(clearGlobalError());
  };

  const handleClearAllToasts = () => {
    dispatch(clearAllToasts());
  };

  return {
    // State
    toasts,
    globalError,

    // Methods
    showError: handleShowError,
    showSuccess: handleShowSuccess,
    showWarning: handleShowWarning,
    showInfo: handleShowInfo,
    removeToast: handleRemoveToast,
    setError: handleSetGlobalError, // Alias for backwards compatibility
    clearError: handleClearGlobalError, // Alias for backwards compatibility
    setGlobalError: handleSetGlobalError,
    clearGlobalError: handleClearGlobalError,
    clearAllToasts: handleClearAllToasts,
  };
};

export default useErrorRedux;
