// frontend/src/hooks/useNetwork.js

import { useState, useEffect, useRef } from "react";
import useErrorRedux from "./useErrorRedux";

/**
 * Custom hook to monitor network connectivity and show appropriate messages
 * @param {Object} options - Configuration options
 * @returns {Object} - Network status information
 */
const useNetwork = (options = {}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const { showError, showSuccess, showWarning } = useErrorRedux();

  // Use refs to track previous values and to hold merged options
  const prevOnlineState = useRef(navigator.onLine);
  const optionsRef = useRef({
    showToasts: true,
    offlineMessage:
      "You are currently offline. Some features may be unavailable.",
    onlineMessage: "Your connection has been restored.",
    slowConnectionMessage:
      "You have a slow internet connection. Some features may be slower than usual.",
    ...options,
  });

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = {
      showToasts: true,
      offlineMessage:
        "You are currently offline. Some features may be unavailable.",
      onlineMessage: "Your connection has been restored.",
      slowConnectionMessage:
        "You have a slow internet connection. Some features may be slower than usual.",
      ...options,
    };
  }, [options]);

  useEffect(() => {
    // Handle coming online
    const handleOnline = () => {
      if (!prevOnlineState.current) {
        setIsOnline(true);
        setReconnecting(false);
        prevOnlineState.current = true;

        if (optionsRef.current.showToasts) {
          showSuccess(optionsRef.current.onlineMessage);
        }
      }
    };

    // Handle going offline
    const handleOffline = () => {
      if (prevOnlineState.current) {
        setIsOnline(false);
        prevOnlineState.current = false;

        if (optionsRef.current.showToasts) {
          showError(optionsRef.current.offlineMessage);
        }
      }
    };

    // Handle connection change (for mobile devices)
    const handleConnectionChange = () => {
      if ("connection" in navigator) {
        const { effectiveType } = navigator.connection;
        setConnectionType((prevType) => {
          if (prevType !== effectiveType) {
            if (
              (effectiveType === "2g" || effectiveType === "slow-2g") &&
              optionsRef.current.showToasts
            ) {
              showWarning(optionsRef.current.slowConnectionMessage);
            }
            return effectiveType;
          }
          return prevType;
        });
      }
    };

    // Setup event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("connection" in navigator) {
      setConnectionType(navigator.connection.effectiveType);
      navigator.connection.addEventListener("change", handleConnectionChange);
    }

    // Show initial offline message if needed
    if (!navigator.onLine && optionsRef.current.showToasts) {
      showError(optionsRef.current.offlineMessage);
    }

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
  }, [showError, showSuccess, showWarning]);

  return {
    isOnline,
    connectionType,
    reconnecting,
    isSlowConnection: connectionType === "2g" || connectionType === "slow-2g",
  };
};

export default useNetwork;
