import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

/**
 * NotFound component for 404 pages or resources not found
 *
 * @param {Object} props - Component props
 * @param {string} [props.title='Page Not Found'] - Title of the error page
 * @param {string} [props.message='The page you are looking for does not exist or has been moved.'] - Error message
 * @param {string} [props.backTo='/'] - Path to navigate back to
 * @param {string} [props.backText='Back to Dashboard'] - Text for the back button
 * @param {string} [props.illustration='404'] - Type of illustration to show: '404', 'empty', 'error'
 * @param {string} [props.className] - Additional CSS classes
 */
const NotFound = ({
  title = "Page Not Found",
  message = "The page you are looking for does not exist or has been moved.",
  backTo = "/",
  backText = "Back to Dashboard",
  illustration = "404",
  className = "",
  ...rest
}) => {
  return (
    <div className={`admin-not-found ${className}`} {...rest}>
      <div className="admin-not-found-content">
        <div
          className={`admin-not-found-illustration admin-not-found-illustration-${illustration}`}
        >
          {illustration === "404" && (
            <div className="admin-not-found-404">
              <span>4</span>
              <span>0</span>
              <span>4</span>
            </div>
          )}
          {illustration === "empty" && (
            <div className="admin-not-found-empty">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="96"
                height="96"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M8 21h8"></path>
                <path d="M12 17v4"></path>
                <path d="M2 8h20"></path>
              </svg>
            </div>
          )}
          {illustration === "error" && (
            <div className="admin-not-found-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="96"
                height="96"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
          )}
        </div>

        <h1 className="admin-not-found-title">{title}</h1>
        <p className="admin-not-found-message">{message}</p>

        <Link to={backTo} className="admin-not-found-button">
          {backText}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
