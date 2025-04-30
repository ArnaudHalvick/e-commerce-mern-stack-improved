import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

/**
 * NavLogo Component
 * @param {Object} props - Component props
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element} NavLogo component
 */
const NavLogo = ({ inTransition }) => (
  <Link
    to="/"
    className="navbar-logo"
    onClick={(e) => inTransition && e.preventDefault()}
    aria-label="Shopper home page"
  >
    <img src={logo} alt="Shopper logo" className="navbar-logo-img" />
    <p className="navbar-logo-text">SHOPPER</p>
  </Link>
);

export default NavLogo;
