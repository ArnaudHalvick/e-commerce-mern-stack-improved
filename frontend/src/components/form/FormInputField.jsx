import React, { useState } from "react";
import PropTypes from "prop-types";
import "./FormInputField.css";

/**
 * FormInputField - A reusable form input field with error display
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
 * @param {string} props.className - Additional CSS class names
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
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-field__label">
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
};

export default FormInputField;
