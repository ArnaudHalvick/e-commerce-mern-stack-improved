import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

/**
 * Custom hook to use the toast system
 * @returns {Object} Toast methods: { showToast, showSuccessToast, showErrorToast, showWarningToast, showInfoToast, removeToast, clearToasts }
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
