import React from "react";
import PropTypes from "prop-types";
import Spinner from "../../../components/ui/spinner";

/**
 * StatusIcon component for displaying verification status icons
 *
 * @param {object} props Component props
 * @param {string} props.status The status to display (loading, success, error)
 */
const StatusIcon = ({ status }) => {
  return (
    <div
      className={`status-icon ${status}`}
      role="img"
      aria-label={
        status === "loading"
          ? "Loading"
          : status === "success"
          ? "Success"
          : "Error"
      }
    >
      {status === "loading" ? (
        <Spinner size="small" showMessage={false} />
      ) : status === "success" ? (
        <span>✓</span>
      ) : (
        <span>✗</span>
      )}
    </div>
  );
};

StatusIcon.propTypes = {
  status: PropTypes.oneOf(["loading", "success", "error"]).isRequired,
};

export default StatusIcon;
