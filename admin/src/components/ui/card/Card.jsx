import React from "react";
import "./Card.css";

/**
 * Card subcomponents
 */
const CardHeader = ({ children, className = "", ...rest }) => {
  return (
    <div className={`admin-card-header ${className}`} {...rest}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = "", ...rest }) => {
  return (
    <div className={`admin-card-body ${className}`} {...rest}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = "", ...rest }) => {
  return (
    <div className={`admin-card-footer ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 */
const Card = ({ children, className = "", ...rest }) => {
  return (
    <div className={`admin-card ${className}`} {...rest}>
      {children}
    </div>
  );
};

// Attach subcomponents
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
