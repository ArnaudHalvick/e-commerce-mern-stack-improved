import React, { forwardRef } from "react";
import "./Select.css";

/**
 * Select component
 *
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Select size: 'small', 'medium', 'large'
 * @param {string} [props.label] - Select label
 * @param {string} [props.error] - Error message
 * @param {string} [props.helper] - Helper text
 * @param {boolean} [props.required=false] - Whether select is required
 * @param {boolean} [props.disabled=false] - Whether select is disabled
 * @param {boolean} [props.fullWidth=false] - Whether select should take full width
 * @param {string} [props.placeholder] - Select placeholder (first empty option)
 * @param {Array} [props.options=[]] - Array of options objects with value and label
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.RefObject} ref - Forwarded ref
 */
const Select = forwardRef(
  (
    {
      size = "medium",
      label,
      error,
      helper,
      required = false,
      disabled = false,
      fullWidth = false,
      placeholder,
      options = [],
      className = "",
      id,
      ...rest
    },
    ref
  ) => {
    // Generate a unique ID for the select if not provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div
        className={`admin-select-group ${
          fullWidth ? "admin-select-group-full" : ""
        }`}
      >
        {label && (
          <label htmlFor={selectId} className="admin-select-label">
            {label}{" "}
            {required && <span className="admin-select-required">*</span>}
          </label>
        )}

        <div className="admin-select-wrapper">
          <select
            id={selectId}
            ref={ref}
            className={`admin-select admin-select-${size} ${
              error ? "admin-select-error" : ""
            } ${fullWidth ? "admin-select-full" : ""} ${className}`}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helper
                ? `${selectId}-helper`
                : undefined
            }
            required={required}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="admin-select-arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {error && (
          <div id={`${selectId}-error`} className="admin-select-error-text">
            {error}
          </div>
        )}

        {helper && !error && (
          <div id={`${selectId}-helper`} className="admin-select-helper-text">
            {helper}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
