import React, { useState } from "react";
import PropTypes from "prop-types";
import "./FormInputField.css";

/**
 * FormInputField - A reusable customizable form input field with error display and validation
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, email, password, etc.) or "select" for dropdown
 * @param {string} props.name - Input name (supports nested fields like "address.street")
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler (optional)
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string|Object} props.error - Error message or object for nested fields
 * @param {Object} props.validation - Validation attributes (pattern, minLength, etc.)
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS class names for the input
 * @param {string} props.labelClassName - Additional CSS class names for the label
 * @param {string} props.containerClassName - Additional CSS class names for the container
 * @param {Object} props.style - Additional inline styles for the input
 * @param {Object} props.containerStyle - Additional inline styles for the container
 * @param {Object} props.labelStyle - Additional inline styles for the label
 * @param {Object} props.validationSchema - Schema object for validation
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {boolean} props.showErrorsImmediately - Whether to show errors immediately without waiting for field blur
 * @param {Array} props.options - Options for select inputs (array of {value, label} objects)
 * @param {string} props.autoComplete - HTML autocomplete attribute value
 */
const FormInputField = ({
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  error,
  validation = {},
  required = false,
  className = "",
  labelClassName = "",
  containerClassName = "",
  style = {},
  containerStyle = {},
  labelStyle = {},
  validationSchema = null,
  disabled = false,
  showErrorsImmediately = true, // Default to showing errors immediately
  options = [], // Options for select inputs
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    setIsTouched(true); // Mark as touched when focused
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    // Call the parent's onBlur if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  // Check if we're dealing with a nested field (e.g., address.street)
  const isNested = name.includes(".");

  // Get the error message, handling nested errors
  const getErrorMessage = () => {
    if (!error) return null;

    if (isNested) {
      const [parent, child] = name.split(".");
      return error[parent] && error[parent][child]
        ? error[parent][child]
        : null;
    }

    return typeof error === "object" ? error[name] : error;
  };

  const errorMessage = getErrorMessage();
  // Show errors immediately if showErrorsImmediately is true, or follow the old behavior
  const showError = errorMessage && (showErrorsImmediately || isTouched);

  const inputId = `form-field-${name.replace(".", "-")}`;
  const errorId = `${inputId}-error`;

  // Get validation attributes from schema if provided
  const getValidationAttributes = () => {
    if (!validationSchema) return validation;

    let fieldSchema;
    if (isNested) {
      const [parent, child] = name.split(".");
      fieldSchema = validationSchema[parent]?.[child];
    } else {
      fieldSchema = validationSchema[name];
    }

    if (!fieldSchema) return validation;

    const attributes = { ...validation };

    // Add required attribute if it exists
    if (fieldSchema.required) {
      attributes.required = true;
    }

    // Add min length if it exists
    if (fieldSchema.minLength) {
      attributes.minLength = fieldSchema.minLength;
    }

    // Add max length if it exists
    if (fieldSchema.maxLength) {
      attributes.maxLength = fieldSchema.maxLength;
    }

    // Add pattern if it exists
    if (fieldSchema.pattern) {
      attributes.pattern = fieldSchema.pattern.toString().slice(1, -1);
    }

    // Add title with validation message
    if (fieldSchema.message) {
      attributes.title = fieldSchema.message;
    }

    return attributes;
  };

  // Define the input classes
  const baseClassName = "form-input";
  const inputClassName = `${baseClassName} ${
    showError ? `${baseClassName}--error` : ""
  } ${isFocused ? `${baseClassName}--focused` : ""} ${className}`;

  const combinedValidation = getValidationAttributes();

  return (
    <div className={`form-field ${containerClassName}`} style={containerStyle}>
      {label && (
        <label
          htmlFor={inputId}
          className={`form-field__label ${labelClassName}`}
          style={labelStyle}
        >
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      <div className="form-field__input-container">
        {type === "select" ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={inputClassName}
            required={required}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? errorId : undefined}
            style={style}
            disabled={disabled}
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
        ) : (
          <input
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={inputClassName}
            required={required}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? errorId : undefined}
            style={style}
            disabled={disabled}
            autoComplete={autoComplete}
            {...combinedValidation}
          />
        )}
      </div>

      {showError && (
        <div id={errorId} className="form-field__error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

FormInputField.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  validation: PropTypes.object,
  required: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  containerClassName: PropTypes.string,
  style: PropTypes.object,
  containerStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  validationSchema: PropTypes.object,
  disabled: PropTypes.bool,
  showErrorsImmediately: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  autoComplete: PropTypes.string,
};

export default FormInputField;
