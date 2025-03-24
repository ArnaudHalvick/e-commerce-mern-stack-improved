import React, { useState } from "react";
import PropTypes from "prop-types";
import "./FormInputField.css";

/**
 * FormInputField - A reusable customizable form input field with error display
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.error - Error message
 * @param {Object} props.validation - Validation attributes (pattern, minLength, etc.)
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS class names for the input
 * @param {string} props.labelClassName - Additional CSS class names for the label
 * @param {string} props.containerClassName - Additional CSS class names for the container
 * @param {Object} props.style - Additional inline styles for the input
 * @param {Object} props.containerStyle - Additional inline styles for the container
 * @param {Object} props.labelStyle - Additional inline styles for the label
 */
const FormInputField = ({
  type = "text",
  name,
  value,
  onChange,
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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
  };

  const showError = error && (isTouched || isFocused === false);

  const inputId = `form-field-${name}`;
  const errorId = `${inputId}-error`;

  // Define the input classes
  const baseClassName = "form-input";
  const inputClassName = `${baseClassName} ${
    showError ? `${baseClassName}--error` : ""
  } ${className}`;

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
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          style={style}
          {...validation}
        />
      </div>

      {showError && (
        <div id={errorId} className="form-field__error" role="alert">
          {error}
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
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  validation: PropTypes.object,
  required: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  containerClassName: PropTypes.string,
  style: PropTypes.object,
  containerStyle: PropTypes.object,
  labelStyle: PropTypes.object,
};

export default FormInputField;
