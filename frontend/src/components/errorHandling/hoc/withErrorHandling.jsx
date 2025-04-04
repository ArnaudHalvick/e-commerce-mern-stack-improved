import React, { useState } from "react";
import useErrorRedux from "../../../hooks/useErrorRedux";
import Spinner from "../../ui/spinner"; // Assuming you have a Spinner component
import EmptyState from "../emptyState/EmptyState";

/**
 * Higher-order component that adds loading, error handling, and empty state handling
 * Now using Redux for state management instead of Context API
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Enhanced component with error handling
 */
const withErrorHandling = (WrappedComponent, options = {}) => {
  // Default options
  const defaultOptions = {
    loadingMessage: "Loading...",
    errorTitle: "Something went wrong",
    errorActions: [
      {
        label: "Try Again",
        type: "primary",
        // The onClick handler will be set in the returned component
      },
    ],
    showErrorToast: true,
  };

  // Merge default options with provided options
  const config = { ...defaultOptions, ...options };

  // Return the enhanced component
  return function WithErrorHandling(props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const { showError } = useErrorRedux();

    // Function to execute an async operation with error handling
    const handleAsync = async (asyncFn, successCallback, errorCallback) => {
      try {
        setLoading(true);
        setError(null);

        const result = await asyncFn();

        // Check if result is empty (can be customized based on your data structure)
        const resultIsEmpty = Array.isArray(result)
          ? result.length === 0
          : !result;
        setIsEmpty(resultIsEmpty);

        // Execute success callback if provided
        if (successCallback) {
          successCallback(result);
        }

        return result;
      } catch (err) {
        // Set error state
        setError(err);

        // Show error toast if configured
        if (config.showErrorToast) {
          showError(err.message || "An error occurred");
        }

        // Execute error callback if provided
        if (errorCallback) {
          errorCallback(err);
        }

        return null;
      } finally {
        setLoading(false);
      }
    };

    // Handle retry action
    const handleRetry = () => {
      // Reset states
      setError(null);
      setIsEmpty(false);

      // If there's a retry function in props, call it
      if (props.onRetry && typeof props.onRetry === "function") {
        props.onRetry();
      }
    };

    // Add retry action to error actions
    const errorActions = config.errorActions.map((action) => {
      if (action.label === "Try Again") {
        return { ...action, onClick: handleRetry };
      }
      return action;
    });

    // Show spinner if loading
    if (loading) {
      return <Spinner message={config.loadingMessage} />;
    }

    // Show error state if there's an error
    if (error) {
      return (
        <EmptyState
          title={config.errorTitle}
          message={error.message || "An unexpected error occurred"}
          actions={errorActions}
        />
      );
    }

    // Show empty state if no data
    if (isEmpty && props.showEmptyState !== false) {
      return (
        <EmptyState
          title={config.emptyTitle || "No data found"}
          message={config.emptyMessage || "There are no items to display."}
          actions={config.emptyActions || []}
        />
      );
    }

    // Pass the handleAsync function to the wrapped component
    return (
      <WrappedComponent
        {...props}
        handleAsync={handleAsync}
        isLoading={loading}
        error={error}
        isEmpty={isEmpty}
      />
    );
  };
};

export default withErrorHandling;
