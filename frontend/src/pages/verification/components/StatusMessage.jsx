import React from "react";
import PropTypes from "prop-types";

/**
 * StatusMessage component for displaying verification status messages
 *
 * @param {object} props Component props
 * @param {string} props.message The message to display
 * @param {boolean} props.success Whether the status is successful
 * @param {React.ReactNode} props.children Optional children to render below the message
 */
const StatusMessage = ({ message, success, children }) => {
  return (
    <div
      className={`verification-message ${success ? "success" : "error"}`}
      role="status"
      aria-live="polite"
    >
      <p>{message}</p>
      {children}
    </div>
  );
};

StatusMessage.propTypes = {
  message: PropTypes.string.isRequired,
  success: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

StatusMessage.defaultProps = {
  success: false,
};

export default StatusMessage;
