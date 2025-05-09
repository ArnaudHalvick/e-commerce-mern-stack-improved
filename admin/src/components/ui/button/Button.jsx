import React from "react";
import "./Button.css";

/**
 * Button component with different variants and sizes
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant: 'primary', 'secondary', 'outline', 'danger', 'success'
 * @param {string} [props.size='medium'] - Button size: 'small', 'medium', 'large'
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type='button'] - Button type attribute
 * @param {string} [props.className] - Additional CSS classes
 */
const Button = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  children,
  onClick,
  type = "button",
  className = "",
  ...rest
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick && onClick(e);
    }
  };

  return (
    <button
      className={`admin-btn admin-btn-${variant} admin-btn-${size} ${
        fullWidth ? "admin-btn-full" : ""
      } ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      type={type}
      tabIndex={disabled ? "-1" : "0"}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
