import { useState, useEffect } from "react";
import { useError } from "../context/ErrorContext";

/**
 * Custom hook to monitor network connectivity and show appropriate messages
 * @param {Object} options - Configuration options
 * @returns {Object} - Network status information
 */
const useNetwork = (options = {}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const { showError, showSuccess, showWarning } = useError();

  // Default options
  const defaultOptions = {
    showToasts: true,
    offlineMessage:
      "You are currently offline. Some features may be unavailable.",
    onlineMessage: "Your connection has been restored.",
    slowConnectionMessage:
      "You have a slow internet connection. Some features may be slower than usual.",
  };

  // Merge default options with provided options
  const config = { ...defaultOptions, ...options };

  useEffect(() => {
    // Handle coming online
    const handleOnline = () => {
      setIsOnline(true);
      setReconnecting(false);
      if (config.showToasts) {
        showSuccess(config.onlineMessage);
      }
    };

    // Handle going offline
    const handleOffline = () => {
      setIsOnline(false);
      if (config.showToasts) {
        showError(config.offlineMessage);
      }
    };

    // Handle connection change (for mobile devices)
    const handleConnectionChange = () => {
      // Get connection information if available
      if ("connection" in navigator) {
        const { effectiveType } = navigator.connection;

        setConnectionType(effectiveType);

        // Show warning for slow connections
        if (effectiveType === "2g" || effectiveType === "slow-2g") {
          if (config.showToasts) {
            showWarning(config.slowConnectionMessage);
          }
        }
      }
    };

    // Setup event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Setup connection monitoring if available
    if ("connection" in navigator) {
      // Set initial connection type
      setConnectionType(navigator.connection.effectiveType);

      // Listen for connection changes
      navigator.connection.addEventListener("change", handleConnectionChange);
    }

    // Show initial offline message if offline
    if (!navigator.onLine && config.showToasts) {
      showError(config.offlineMessage);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if ("connection" in navigator) {
        navigator.connection.removeEventListener(
          "change",
          handleConnectionChange
        );
      }
    };
  }, [config, showError, showSuccess, showWarning]);

  return {
    isOnline,
    connectionType,
    reconnecting,
    isSlowConnection: connectionType === "2g" || connectionType === "slow-2g",
  };
};

export default useNetwork;
