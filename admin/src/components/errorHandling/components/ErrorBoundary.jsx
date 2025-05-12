import React, { Component } from "react";
import "../styles/ErrorBoundary.css";

/**
 * ErrorBoundary component that catches JavaScript errors in child components
 * and displays a fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({ errorInfo });

    // If onError callback is provided, call it
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    const isDevelopment =
      typeof window !== "undefined" && window.ENV === "development";
    if (isDevelopment) {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // If onReset callback is provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      resetButtonText = "Try Again",
      showReset = true,
    } = this.props;

    const isDevelopment =
      typeof window !== "undefined" && window.ENV === "development";

    if (hasError) {
      // Render custom fallback UI if provided
      if (fallback) {
        if (typeof fallback === "function") {
          return fallback({ error, errorInfo, resetError: this.handleReset });
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="admin-error-boundary">
          <div className="admin-error-boundary-icon">❌</div>
          <h2 className="admin-error-boundary-title">Something went wrong</h2>
          <p className="admin-error-boundary-message">
            {isDevelopment
              ? error?.message || "An unexpected error occurred"
              : "An unexpected error occurred. Please try again later."}
          </p>

          {/* Show component stack in development */}
          {isDevelopment && errorInfo?.componentStack && (
            <details className="admin-error-boundary-details">
              <summary>Component Stack</summary>
              <pre className="admin-error-boundary-stack">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          {showReset && (
            <button
              className="admin-error-boundary-button"
              onClick={this.handleReset}
            >
              {resetButtonText}
            </button>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
