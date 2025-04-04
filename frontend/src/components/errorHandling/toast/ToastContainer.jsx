import React, { useEffect } from "react";
import Toast from "./Toast";
import useErrorRedux from "../../../hooks/useErrorRedux";
import "../styles/ToastStyles.css";

/**
 * ToastContainer Component - Container for managing multiple toast notifications
 * Automatically positioned at the top-right of the viewport
 * Now using Redux for state management instead of Context API
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useErrorRedux();

  // Auto-remove toasts based on their duration
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

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
