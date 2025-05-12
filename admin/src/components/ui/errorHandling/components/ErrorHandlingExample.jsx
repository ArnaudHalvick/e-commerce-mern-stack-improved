import React, { useState } from "react";
import Alert from "./Alert";
import ErrorBoundary from "./ErrorBoundary";
import { useToast } from "../toast/hooks/useToast";
import ErrorPage from "./ErrorPage";
import useErrorHandler from "../hooks/useErrorHandler";
import "../styles/ErrorHandlingExample.css";

// Component that will throw an error for demonstration
const ErrorThrower = () => {
  if (Math.random() > 0.5) {
    throw new Error("This is a demo error from ErrorThrower component");
  }
  return <div>This component randomly throws errors (50% chance)</div>;
};

/**
 * Example component demonstrating how to use all error handling components
 */
const ErrorHandlingExample = () => {
  const toast = useToast();
  const { handleError } = useErrorHandler();
  const [showErrorThrower, setShowErrorThrower] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);

  const showSuccessToast = () => {
    toast.showSuccessToast("Operation completed successfully!");
  };

  const showErrorToast = () => {
    toast.showErrorToast("An error occurred while processing your request");
  };

  const showWarningToast = () => {
    toast.showWarningToast("This action might have unexpected consequences");
  };

  const showInfoToast = () => {
    toast.showInfoToast("Your data is being processed");
  };

  const simulateError = () => {
    try {
      // Simulate an API error
      throw new Error("API request failed with status 500");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="error-handling-examples">
      <h2>Error Handling Components</h2>

      <section>
        <h3>Toast Notifications</h3>
        <div className="error-example-buttons">
          <button onClick={showSuccessToast}>Show Success Toast</button>
          <button onClick={showErrorToast}>Show Error Toast</button>
          <button onClick={showWarningToast}>Show Warning Toast</button>
          <button onClick={showInfoToast}>Show Info Toast</button>
          <button onClick={simulateError}>Simulate Error</button>
        </div>
      </section>

      <section>
        <h3>Alerts</h3>
        <div className="error-example-alerts">
          {alertVisible && (
            <Alert
              variant="success"
              title="Success!"
              dismissible
              onDismiss={() => setAlertVisible(false)}
            >
              Your changes have been saved successfully.
            </Alert>
          )}

          <Alert variant="error" title="Error!">
            There was a problem processing your request.
          </Alert>

          <Alert variant="warning" title="Warning!">
            This action cannot be undone.
          </Alert>

          <Alert variant="info" title="Information">
            Your account will be upgraded on your next billing cycle.
          </Alert>

          <Alert variant="error" solid>
            This is a solid error alert without a title.
          </Alert>
        </div>
      </section>

      <section>
        <h3>Error Boundary</h3>
        <p>
          Click the button below to render a component that might throw an
          error.
        </p>
        <button onClick={() => setShowErrorThrower(!showErrorThrower)}>
          {showErrorThrower ? "Hide" : "Show"} Error Thrower
        </button>

        {showErrorThrower && (
          <ErrorBoundary>
            <ErrorThrower />
          </ErrorBoundary>
        )}
      </section>

      <section>
        <h3>Error Pages</h3>
        <div className="error-example-pages">
          <div className="error-page-preview">
            <h4>404 Not Found</h4>
            <div className="error-page-frame">
              <ErrorPage.NotFound />
            </div>
          </div>

          <div className="error-page-preview">
            <h4>500 Server Error</h4>
            <div className="error-page-frame">
              <ErrorPage.ServerError />
            </div>
          </div>

          <div className="error-page-preview">
            <h4>403 Unauthorized</h4>
            <div className="error-page-frame">
              <ErrorPage.Unauthorized />
            </div>
          </div>

          <div className="error-page-preview">
            <h4>Maintenance</h4>
            <div className="error-page-frame">
              <ErrorPage.Maintenance />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ErrorHandlingExample;
