import React from "react";

/**
 * HamburgerMenu Component
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function to handle click event
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element} HamburgerMenu component
 */
const HamburgerMenu = ({ onClick, inTransition }) => (
  <div
    className="navbar-hamburger"
    onClick={() => !inTransition && onClick()}
    tabIndex={0}
    aria-label="Toggle mobile menu"
    role="button"
    onKeyDown={(e) => e.key === "Enter" && !inTransition && onClick()}
  >
    <span className="navbar-hamburger-line"></span>
    <span className="navbar-hamburger-line"></span>
    <span className="navbar-hamburger-line"></span>
  </div>
);

export default HamburgerMenu;
