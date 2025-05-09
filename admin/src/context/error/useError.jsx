import { useContext } from "react";
import ErrorContext from "./ErrorContext";

/**
 * Custom hook to use the Error context
 * @returns {Object} Error context with methods for error, loading and success state
 */
const useError = () => {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error("useError must be used within an ErrorState provider");
  }

  return context;
};

export default useError;
