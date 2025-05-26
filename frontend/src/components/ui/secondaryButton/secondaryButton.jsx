import React from "react";
import PropTypes from "prop-types";
import "./secondaryButton.css";

/**
 * Button - A reusable button component with secondary styling and multiple variants
 *
 * @param {Object} props - Component props
 * @param {string} props.children - Button content (text, icons, etc.)
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.variant - Button style variant (secondary, outline, ghost, danger)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {string} props.className - Additional CSS class names
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.ariaLabel - Accessibility label
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.loadingText - Text to show when loading
 */
const Button = ({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "secondary",
  size = "medium",
  fullWidth = false,
  className = "",
  style = {},
  ariaLabel,
  isLoading = false,
  loadingText = "Loading...",
}) => {
  const handleClick = (e) => {
    if (!disabled && !isLoading && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled && !isLoading) {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      }
    }
  };

  // Build class names
  const baseClassName = "secondary-btn";
  const variantClass = `${baseClassName}--${variant}`;
  const sizeClass = `${baseClassName}--${size}`;
  const fullWidthClass = fullWidth ? `${baseClassName}--full-width` : "";
  const loadingClass = isLoading ? `${baseClassName}--loading` : "";
  const disabledClass = disabled ? `${baseClassName}--disabled` : "";

  const combinedClassName = [
    baseClassName,
    variantClass,
    sizeClass,
    fullWidthClass,
    loadingClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      tabIndex={0}
      style={style}
    >
      {isLoading ? (
        <>
          <span className="secondary-btn__spinner" aria-hidden="true"></span>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf([
    "secondary",
    "outline",
    "ghost",
    "danger",
    "success",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  ariaLabel: PropTypes.string,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
};

export default Button;
