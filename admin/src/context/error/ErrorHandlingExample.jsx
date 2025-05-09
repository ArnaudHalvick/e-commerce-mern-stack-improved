import React, { useState } from "react";
import { useError } from "../exports/hooks.js";
import { Alert, ErrorBoundary } from "../../components/ui/errorHandling";
import Spinner from "../../components/ui/spinner/Spinner";

/**
 * Example component demonstrating how to use the error context
 */
const ErrorHandlingExample = () => {
  const {
    setError,
    clearError,
    setLoading,
    clearLoading,
    setSuccess,
    clearSuccess,
    handleApiError,
    error,
    loading,
    success,
  } = useError();

  const [localState, setLocalState] = useState("");

  const simulateError = () => {
    setError("This is a simulated error message", {
      source: "simulateError",
      code: 400,
    });
  };

  const simulateSuccess = () => {
    setSuccess("Operation completed successfully!", {
      id: 123,
      name: "Test Item",
    });
  };

  const simulateApiError = () => {
    // Simulate an API error object similar to axios error
    const fakeApiError = {
      response: {
        status: 404,
        statusText: "Not Found",
        data: {
          message: "Resource not found",
          errors: ["Item with ID 123 does not exist"],
        },
      },
    };

    handleApiError(fakeApiError);
  };

  const simulateLoading = async () => {
    setLoading("dataFetch");

    // Simulate API call with delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess("Data loaded successfully");
    } catch (err) {
      setError(`Failed to load data: ${err.message || "Unknown error"}`);
    } finally {
      clearLoading("dataFetch");
    }
  };

  return (
    <ErrorBoundary>
      <div className="error-context-example">
        <h2>Error Context Example</h2>

        {/* Show current state */}
        <div className="state-display">
          <h3>Current State:</h3>
          <pre>
            {JSON.stringify({ error, loading, success, localState }, null, 2)}
          </pre>
        </div>

        {/* Error message display */}
        {error && (
          <Alert
            variant="error"
            title="Error"
            dismissible
            onDismiss={clearError}
          >
            {error.message}
            {error.details && (
              <pre className="error-details">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </Alert>
        )}

        {/* Success message display */}
        {success && (
          <Alert
            variant="success"
            title="Success"
            dismissible
            onDismiss={clearSuccess}
          >
            {success.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading === true ? (
          <div className="loading-container">
            <Spinner />
            <span>Loading...</span>
          </div>
        ) : typeof loading === "object" && loading.dataFetch ? (
          <div className="loading-container">
            <Spinner />
            <span>Fetching data...</span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="actions">
          <button onClick={simulateError}>Trigger Error</button>
          <button onClick={simulateSuccess}>Trigger Success</button>
          <button onClick={simulateApiError}>Simulate API Error</button>
          <button
            onClick={simulateLoading}
            disabled={loading && loading.dataFetch}
          >
            {loading && loading.dataFetch ? "Loading..." : "Simulate Loading"}
          </button>
          <button onClick={() => setLocalState(Date.now().toString())}>
            Update Local State
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ErrorHandlingExample;
