// frontend/src/context/ErrorContext.jsx

import React, { createContext, useContext } from "react";
import useErrorRedux from "../hooks/useErrorRedux";

/**
 * ErrorContext - Compatibility layer for the migration from Context API to Redux
 * This uses Redux under the hood but exposes the same API as the old ErrorContext
 */
const ErrorContext = createContext();

/**
 * ErrorProvider Component - Compatibility wrapper that uses Redux
 * This allows components to continue using the old useError hook while we migrate them
 */
export const ErrorProvider = ({ children }) => {
  // Use the Redux error hook to get the error state and methods
  const errorRedux = useErrorRedux();

  return (
    <ErrorContext.Provider value={errorRedux}>{children}</ErrorContext.Provider>
  );
};

/**
 * Custom hook to use the error context
 * This now uses Redux under the hood but keeps the same API
 * @returns {Object} Error context value
 */
export const useError = () => {
  // Get direct access to Redux error state through the hook
  const errorRedux = useErrorRedux();

  // Try to get context value if it exists (for compatibility)
  const context = useContext(ErrorContext);

  // Return either the context value (if ErrorProvider is used) or direct Redux access
  return context !== undefined ? context : errorRedux;
};

export default ErrorContext;
