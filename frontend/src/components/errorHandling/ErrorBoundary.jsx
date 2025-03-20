import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./ErrorStyles.css";

/**
 * Error Boundary Component - Catches JavaScript errors anywhere in its child component tree
 * and displays a fallback UI instead of crashing the whole app
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

  // Update state when an error occurs
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Log error details
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    console.error("Error caught by boundary:", error, errorInfo);

    // Here you could also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-content">
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-text">
              We're sorry, but we encountered an error while processing your
              request.
            </p>

            {this.props.showDetails && this.state.error && (
              <div className="error-details">
                <h3 className="error-details-title">Error Details:</h3>
                <p className="error-text">{this.state.error.toString()}</p>
                <pre className="error-details-code">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="error-button reload"
              >
                Reload Page
              </button>
              <Link to="/" className="error-button home">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
