import React from "react";
import { Link } from "react-router-dom";
import { NAV_ITEMS } from "../hooks";

/**
 * NavMenu Component
 * @param {Object} props - Component props
 * @param {string} props.activeMenu - Currently active menu item ID
 * @param {Function} props.handleMenuClick - Function to handle menu item click
 * @param {boolean} props.isMobileMenuOpen - Whether the mobile menu is open
 * @returns {JSX.Element} NavMenu component
 */
const NavMenu = ({ activeMenu, handleMenuClick, isMobileMenuOpen }) => (
  <ul
    className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}
    role="menubar"
  >
    {NAV_ITEMS.map((item) => (
      <li
        key={item.id}
        className="navbar-menu-item"
        onClick={() => handleMenuClick(item.id)}
        role="menuitem"
      >
        <Link to={item.path}>
          {item.label}{" "}
          {activeMenu === item.id && <hr className="navbar-menu-indicator" />}
        </Link>
      </li>
    ))}
  </ul>
);

export default NavMenu;
