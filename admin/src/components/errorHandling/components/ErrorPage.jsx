import React from "react";
import { Link } from "react-router-dom";
import "../styles/ErrorPage.css";

/**
 * ErrorPage component for displaying full-page error states
 *
 * @param {Object} props - Component props
 * @param {string} [props.title="Something went wrong"] - Error title
 * @param {string} [props.message="We're having trouble processing your request. Please try again later."] - Error message
 * @param {string} [props.code] - Error code to display (e.g., "500", "404")
 * @param {React.ReactNode} [props.action] - Custom action element (button, link, etc.)
 * @param {string} [props.backTo="/"] - Path to navigate back to
 * @param {string} [props.backText="Back to Dashboard"] - Text for the back link
 * @param {string} [props.className] - Additional CSS classes
 */
const ErrorPage = ({
  title = "Something went wrong",
  message = "We're having trouble processing your request. Please try again later.",
  code,
  action,
  backTo = "/",
  backText = "Back to Dashboard",
  className = "",
  ...rest
}) => {
  return (
    <div className={`admin-error-page ${className}`} {...rest}>
      <div className="admin-error-page-content">
        {code && <div className="admin-error-page-code">{code}</div>}

        <h1 className="admin-error-page-title">{title}</h1>
        <p className="admin-error-page-message">{message}</p>

        <div className="admin-error-page-actions">
          {action || (
            <Link to={backTo} className="admin-error-page-back-link">
              {backText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Predefined error pages
 */
ErrorPage.NotFound = (props) => (
  <ErrorPage
    title="Page Not Found"
    message="The page you are looking for doesn't exist or has been moved."
    code="404"
    backText="Back to Home"
    {...props}
  />
);

ErrorPage.ServerError = (props) => (
  <ErrorPage
    title="Server Error"
    message="We're experiencing some issues with our server. Please try again later."
    code="500"
    {...props}
  />
);

ErrorPage.Unauthorized = (props) => (
  <ErrorPage
    title="Unauthorized Access"
    message="You don't have permission to access this resource."
    code="403"
    backTo="/login"
    backText="Back to Login"
    {...props}
  />
);

ErrorPage.Maintenance = (props) => (
  <ErrorPage
    title="Under Maintenance"
    message="Our system is currently undergoing scheduled maintenance. Please check back soon."
    {...props}
  />
);

export default ErrorPage;
