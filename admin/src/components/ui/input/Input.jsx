import React, { forwardRef } from "react";
import "./Input.css";

/**
 * Input component with different types and states
 *
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.size='medium'] - Input size: 'small', 'medium', 'large'
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message
 * @param {string} [props.helper] - Helper text
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {boolean} [props.fullWidth=false] - Whether input should take full width
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.autoComplete] - Autocomplete attribute for the input
 * @param {React.RefObject} ref - Forwarded ref
 */
const Input = forwardRef(
  (
    {
      type = "text",
      size = "medium",
      label,
      error,
      helper,
      required = false,
      disabled = false,
      fullWidth = false,
      placeholder,
      className = "",
      id,
      autoComplete,
      ...rest
    },
    ref
  ) => {
    // Generate a unique ID for the input if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determine if this is a textarea
    const isTextArea = type === "textarea";

    // Render the input element (either input or textarea)
    const renderInput = () => {
      const baseClassName = `admin-input admin-input-${size} ${
        error ? "admin-input-error" : ""
      } ${fullWidth ? "admin-input-full" : ""} ${className}`;

      if (isTextArea) {
        return (
          <textarea
            id={inputId}
            ref={ref}
            className={baseClassName}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helper
                ? `${inputId}-helper`
                : undefined
            }
            {...rest}
          />
        );
      }

      return (
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={baseClassName}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          autoComplete={autoComplete}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helper
              ? `${inputId}-helper`
              : undefined
          }
          {...rest}
        />
      );
    };

    return (
      <div
        className={`admin-input-group ${
          fullWidth ? "admin-input-group-full" : ""
        }`}
      >
        {label && (
          <label htmlFor={inputId} className="admin-input-label">
            {label}{" "}
            {required && <span className="admin-input-required">*</span>}
          </label>
        )}

        {renderInput()}

        {error && (
          <div id={`${inputId}-error`} className="admin-input-error-text">
            {error}
          </div>
        )}

        {helper && !error && (
          <div id={`${inputId}-helper`} className="admin-input-helper-text">
            {helper}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
