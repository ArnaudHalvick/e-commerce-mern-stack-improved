import React from "react";
import { ErrorDemo } from "../components/errorHandling";

/**
 * Error Demo Page - Demonstrates the error handling system
 */
const ErrorDemoPage = () => {
  return (
    <div className="error-demo-page">
      <h1>Error Handling System</h1>
      <p>
        This page demonstrates the error handling capabilities of the
        application.
      </p>
      <ErrorDemo />
    </div>
  );
};

export default ErrorDemoPage;
