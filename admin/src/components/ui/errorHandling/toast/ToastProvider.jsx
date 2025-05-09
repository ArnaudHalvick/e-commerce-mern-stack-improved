import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast";

// Create the context
const ToastContext = createContext(null);

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

/**
 * Toast Provider component to manage multiple toast notifications
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.position="top-right"] - Default position for toasts
 * @param {number} [props.maxToasts=5] - Maximum number of toasts to show at once
 */
const ToastProvider = ({ children, position = "top-right", maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = useCallback(
    ({
      message,
      variant = "info",
      duration = 3000,
      position: toastPosition,
    }) => {
      const id = Date.now().toString();

      setToasts((prevToasts) => {
        // Remove oldest toasts if we exceed maxToasts
        const updatedToasts = [...prevToasts];
        if (updatedToasts.length >= maxToasts) {
          updatedToasts.splice(0, updatedToasts.length - maxToasts + 1);
        }

        return [
          ...updatedToasts,
          {
            id,
            message,
            variant,
            duration,
            position: toastPosition || position,
          },
        ];
      });

      return id;
    },
    [position, maxToasts]
  );

  // Helper methods for common toast types
  const showSuccessToast = useCallback(
    (message, options = {}) => {
      return showToast({ message, variant: "success", ...options });
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (message, options = {}) => {
      return showToast({ message, variant: "error", ...options });
    },
    [showToast]
  );

  const showWarningToast = useCallback(
    (message, options = {}) => {
      return showToast({ message, variant: "warning", ...options });
    },
    [showToast]
  );

  const showInfoToast = useCallback(
    (message, options = {}) => {
      return showToast({ message, variant: "info", ...options });
    },
    [showToast]
  );

  // Remove a toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Render all active toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          position={toast.position}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
