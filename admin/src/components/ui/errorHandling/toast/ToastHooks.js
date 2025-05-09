import { useContext } from "react";
import { ToastContext } from "./ToastContext";

/**
 * Custom hook to use the toast system
 * @returns {Object} Toast methods: { showToast, clearToasts }
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
