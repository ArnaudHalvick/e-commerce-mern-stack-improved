import React, { useState } from "react";
import { useError } from "../../../../context/exports/hooks.js";
import { Alert, ErrorBoundary } from "../index.js";
import Spinner from "../../spinner/Spinner.jsx";

/**
 * Example component demonstrating the integration of Error Context with Error Handling components
 */
const ErrorContextIntegration = () => {
  const {
    error,
    loading,
    success,
    setError,
    clearError,
    setLoading,
    clearLoading,
    setSuccess,
    clearSuccess,
    handleApiError,
  } = useError();

  const [data, setData] = useState(null);

  // Simulates a successful API call
  const handleSuccessExample = async () => {
    setLoading("loadSuccess");

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful data
      const mockData = { id: 123, name: "Product Example", status: "active" };
      setData(mockData);
      setSuccess("Data loaded successfully!");
    } catch (error) {
      // Use the error in the error message
      setError(`Failed to load data: ${error.message}`);
    } finally {
      clearLoading("loadSuccess");
    }
  };

  // Simulates a failed API call
  const handleErrorExample = async () => {
    setLoading("loadError");

    try {
      // Simulate network request that fails
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network failure")), 1500)
      );
    } catch (err) {
      handleApiError(err, "Failed to load data from server");
    } finally {
      clearLoading("loadError");
    }
  };

  return (
    <ErrorBoundary>
      <div className="error-context-demo">
        <h2>Error Context Integration</h2>

        {/* Display current state */}
        <div className="state-section">
          <h3>Current State</h3>
          <div className="state-grid">
            <div>
              <strong>Loading:</strong>{" "}
              {loading
                ? typeof loading === "object"
                  ? Object.keys(loading).join(", ")
                  : "Global"
                : "False"}
            </div>
            <div>
              <strong>Data:</strong> {data ? "Loaded" : "None"}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="error"
            title="Error Occurred"
            dismissible
            onDismiss={clearError}
          >
            {error.message}
          </Alert>
        )}

        {/* Success Alert */}
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

        {/* Example Buttons */}
        <div className="action-buttons">
          <button
            onClick={handleSuccessExample}
            disabled={loading && loading.loadSuccess}
          >
            {loading && loading.loadSuccess ? (
              <>
                <Spinner size="small" /> Loading...
              </>
            ) : (
              "Simulate Success"
            )}
          </button>

          <button
            onClick={handleErrorExample}
            disabled={loading && loading.loadError}
          >
            {loading && loading.loadError ? (
              <>
                <Spinner size="small" /> Loading...
              </>
            ) : (
              "Simulate Error"
            )}
          </button>
        </div>

        {/* Display Data */}
        {data && (
          <div className="data-display">
            <h3>Loaded Data</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ErrorContextIntegration;
