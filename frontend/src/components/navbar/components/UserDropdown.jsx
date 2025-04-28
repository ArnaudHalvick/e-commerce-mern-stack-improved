import React from "react";
import { Link } from "react-router-dom";
import { InlineSpinner } from "../../../components/ui/spinner";

/**
 * UserDropdown Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dropdown is open
 * @param {Function} props.onClose - Function to close the dropdown
 * @param {Function} props.handleLogout - Function to handle logout
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element|null} UserDropdown component or null if not open
 */
const UserDropdown = ({ isOpen, onClose, handleLogout, inTransition }) => {
  if (!isOpen) return null;

  return (
    <div className="navbar-user-dropdown">
      <Link to="/profile" className="navbar-dropdown-link" onClick={onClose}>
        My Profile
      </Link>
      <Link
        to="/account/orders"
        className="navbar-dropdown-link"
        onClick={onClose}
      >
        My Orders
      </Link>
      <Link to="/cart" className="navbar-dropdown-link" onClick={onClose}>
        My Cart
      </Link>
      <button
        className="navbar-dropdown-button"
        onClick={handleLogout}
        disabled={inTransition}
        aria-label="Logout from account"
      >
        {inTransition ? <InlineSpinner size="small" /> : "Logout"}
      </button>
    </div>
  );
};

export default UserDropdown;
