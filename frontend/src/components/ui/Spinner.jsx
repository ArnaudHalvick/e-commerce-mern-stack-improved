import React from "react";
import "./Spinner.css";

/**
 * Spinner component for loading states
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display during loading
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @returns {JSX.Element} - Spinner component
 */
const Spinner = ({ message = "Loading...", size = "medium" }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
      {message && <div className="spinner-message">{message}</div>}
    </div>
  );
};

export default Spinner;
