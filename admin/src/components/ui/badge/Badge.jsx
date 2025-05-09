import React from "react";
import "./Badge.css";

/**
 * Badge component for status indicators and labels
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Badge variant: 'primary', 'secondary', 'success', 'danger', 'warning', 'info'
 * @param {boolean} [props.outline=false] - Whether to use outline style
 * @param {boolean} [props.pill=false] - Whether to use pill shape (more rounded)
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.className] - Additional CSS classes
 */
const Badge = ({
  variant = "primary",
  outline = false,
  pill = false,
  children,
  className = "",
  ...rest
}) => {
  return (
    <span
      className={`
        admin-badge 
        admin-badge-${variant} 
        ${outline ? "admin-badge-outline" : ""} 
        ${pill ? "admin-badge-pill" : ""} 
        ${className}
      `}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;
