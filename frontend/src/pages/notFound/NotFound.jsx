import React from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import "../../components/errorHandling/ErrorStyles.css";

/**
 * NotFound (404) page component - Displayed when users navigate to non-existent routes
 */
const NotFound = () => {
  const location = useLocation();

  return (
    <>
      <Breadcrumb
        routes={[{ label: "HOME", path: "/" }, { label: "404 NOT FOUND" }]}
      />

      <div className="error-container">
        <div className="error-content">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <p className="error-path">
            <strong>Path:</strong> {location.pathname}
          </p>

          <div className="error-actions">
            <button
              onClick={() => window.history.back()}
              className="error-button reload"
            >
              Go Back
            </button>
            <Link to="/" className="error-button home">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
