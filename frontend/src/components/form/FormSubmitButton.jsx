import React from "react";
import PropTypes from "prop-types";

/**
 * FormSubmitButton - A button component for form submissions with loading state
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether the form is currently being submitted
 * @param {string} props.loadingText - Text to display when loading (defaults to "Submitting...")
 * @param {string} props.text - Button text when not loading
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler (optional, use for non-submit buttons)
 * @param {string} props.type - Button type (defaults to "submit")
 * @param {string} props.className - Additional CSS class names
 */
const FormSubmitButton = ({
  isLoading,
  loadingText = "Submitting...",
  text,
  disabled = false,
  onClick,
  type = "submit",
  className = "",
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (onClick && !disabled && !isLoading) {
        onClick(e);
      }
    }
  };

  // Base classes for the button
  const baseClassName = "form-submit-button";
  const combinedClassName = `${baseClassName} ${
    isLoading ? `${baseClassName}--loading` : ""
  } ${className}`;

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || isLoading}
      onClick={type !== "submit" ? onClick : undefined}
      onKeyDown={type !== "submit" ? handleKeyDown : undefined}
      aria-busy={isLoading}
      tabIndex={0}
    >
      {isLoading ? (
        <>
          <span
            className="form-submit-button__spinner"
            aria-hidden="true"
          ></span>
          <span>{loadingText}</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};

FormSubmitButton.propTypes = {
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default FormSubmitButton;
