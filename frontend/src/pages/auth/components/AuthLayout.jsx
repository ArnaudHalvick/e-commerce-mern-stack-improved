import React from "react";
import PropTypes from "prop-types";
import Breadcrumb from "../../../components/breadcrumbs/Breadcrumb";

/**
 * Shared layout component for all authentication pages
 * Provides consistent structure and styling across auth pages
 */
const AuthLayout = ({
  children,
  title,
  breadcrumbRoutes,
  errorMessage,
  successMessage,
}) => {
  return (
    <div className="auth-page">
      <Breadcrumb routes={breadcrumbRoutes} />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">{title}</h1>

          {/* Display success message if available */}
          {successMessage && (
            <div className="auth-page__success" role="alert">
              {successMessage}
            </div>
          )}

          {/* Display error message if available */}
          {errorMessage && (
            <div className="auth-page__error" role="alert">
              {errorMessage}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  breadcrumbRoutes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ).isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
};

AuthLayout.defaultProps = {
  errorMessage: "",
  successMessage: "",
};

export default AuthLayout;
