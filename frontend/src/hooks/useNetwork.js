// frontend/src/hooks/useNetwork.js

import { useState, useEffect, useRef } from "react";
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

  // Use refs to track previous values and prevent unnecessary re-renders
  const prevOnlineState = useRef(navigator.onLine);
  const optionsRef = useRef(options);

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

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Handle coming online
    const handleOnline = () => {
      // Only update state and show toast if state actually changed
      if (!prevOnlineState.current) {
        setIsOnline(true);
        setReconnecting(false);
        prevOnlineState.current = true;

        if (config.showToasts) {
          showSuccess(config.onlineMessage);
        }
      }
    };

    // Handle going offline
    const handleOffline = () => {
      // Only update state and show toast if state actually changed
      if (prevOnlineState.current) {
        setIsOnline(false);
        prevOnlineState.current = false;

        if (config.showToasts) {
          showError(config.offlineMessage);
        }
      }
    };

    // Handle connection change (for mobile devices)
    const handleConnectionChange = () => {
      // Get connection information if available
      if ("connection" in navigator) {
        const { effectiveType } = navigator.connection;

        // Only update if the connection type actually changed
        if (effectiveType !== connectionType) {
          setConnectionType(effectiveType);

          // Show warning for slow connections
          if (
            (effectiveType === "2g" || effectiveType === "slow-2g") &&
            config.showToasts
          ) {
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

    // Show initial offline message if offline and it's the first render
    if (
      !navigator.onLine &&
      config.showToasts &&
      !isOnline === navigator.onLine
    ) {
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
    // Only re-run this effect if the toast functions change - config is handled through ref
  }, [showError, showSuccess, showWarning]);

  return {
    isOnline,
    connectionType,
    reconnecting,
    isSlowConnection: connectionType === "2g" || connectionType === "slow-2g",
  };
};

export default useNetwork;
