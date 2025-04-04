import React from "react";
import UserDropdown from "./UserDropdown";
import user_icon from "../../assets/user_icon.png";

/**
 * AuthenticatedUser Component
 * @param {Object} props - Component props
 * @param {string} props.displayName - User's display name
 * @param {boolean} props.isUserMenuOpen - Whether the user menu is open
 * @param {Function} props.toggleUserMenu - Function to toggle the user menu
 * @param {Object} props.userMenuRef - Reference to the user menu
 * @param {Function} props.handleLogout - Function to handle logout
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element} AuthenticatedUser component
 */
const AuthenticatedUser = ({
  displayName,
  isUserMenuOpen,
  toggleUserMenu,
  userMenuRef,
  handleLogout,
  inTransition,
}) => (
  <div className="navbar-user-account" ref={userMenuRef}>
    <div
      className="navbar-user-trigger"
      onClick={toggleUserMenu}
      tabIndex={0}
      aria-label="Open user menu"
      aria-expanded={isUserMenuOpen}
      role="button"
      onKeyDown={(e) => e.key === "Enter" && toggleUserMenu()}
    >
      <span className="navbar-welcome-user">{displayName}</span>
      <img src={user_icon} alt="User" className="navbar-user-icon" />
    </div>
    <UserDropdown
      isOpen={isUserMenuOpen}
      onClose={() => toggleUserMenu(false)}
      handleLogout={handleLogout}
      inTransition={inTransition}
    />
  </div>
);

export default AuthenticatedUser;
