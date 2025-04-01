import React from "react";
import Toast from "./Toast";
import { useError } from "../../../context/ErrorContext";
import "../styles/ToastStyles.css";

/**
 * ToastContainer Component - Container for managing multiple toast notifications
 * Automatically positioned at the top-right of the viewport
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useError();

  // Early return if no toasts
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
