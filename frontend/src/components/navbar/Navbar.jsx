// Path: frontend/src/components/navbar/Navbar.jsx

import "./Navbar.css";

import logo from "../assets/logo.png";
import cart_icon from "../assets/cart_icon.png";
import user_icon from "../assets/user_icon.png";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/state";
import CartCount from "./CartCount";

// Navigation menu items
const NAV_ITEMS = [
  { id: "shop", label: "Home", path: "/" },
  { id: "men", label: "Men", path: "/men" },
  { id: "women", label: "Women", path: "/women" },
  { id: "kids", label: "Kids", path: "/kids" },
  { id: "offers", label: "Shop", path: "/offers" },
];

// Nav Logo Component
const NavLogo = ({ inTransition }) => (
  <Link
    to="/"
    className="shop-nav-logo"
    onClick={(e) => inTransition && e.preventDefault()}
    aria-label="Shopper home page"
  >
    <img src={logo} alt="Shopper logo" />
    <p className="shop-nav-logo-text">SHOPPER</p>
  </Link>
);

// Mobile Menu Hamburger Component
const HamburgerMenu = ({ onClick, inTransition }) => (
  <div
    className="hamburger"
    onClick={() => !inTransition && onClick()}
    tabIndex="0"
    aria-label="Toggle mobile menu"
    role="button"
    onKeyDown={(e) => e.key === "Enter" && !inTransition && onClick()}
  >
    <span className="hamburger-line"></span>
    <span className="hamburger-line"></span>
    <span className="hamburger-line"></span>
  </div>
);

// Navigation Menu Items Component
const NavMenu = ({ activeMenu, handleMenuClick, isMobileMenuOpen }) => (
  <ul
    className={`shop-nav-menu ${isMobileMenuOpen ? "active" : ""}`}
    role="menubar"
  >
    {NAV_ITEMS.map((item) => (
      <li
        key={item.id}
        className="shop-nav-menu-item"
        onClick={() => handleMenuClick(item.id)}
        role="menuitem"
      >
        <Link to={item.path}>
          {item.label}{" "}
          {activeMenu === item.id && <hr className="shop-nav-menu-indicator" />}
        </Link>
      </li>
    ))}
  </ul>
);

// User Dropdown Menu Component
const UserDropdown = ({ isOpen, onClose, handleLogout, inTransition }) => {
  if (!isOpen) return null;

  return (
    <div className="user-dropdown">
      <Link to="/profile" className="user-dropdown-link" onClick={onClose}>
        My Profile
      </Link>
      <Link
        to="/account/orders"
        className="user-dropdown-link"
        onClick={onClose}
      >
        My Orders
      </Link>
      <Link to="/cart" className="user-dropdown-link" onClick={onClose}>
        My Cart
      </Link>
      <button
        className="user-dropdown-button"
        onClick={handleLogout}
        disabled={inTransition}
        aria-label="Logout from account"
      >
        Logout
      </button>
    </div>
  );
};

// Authenticated User Component
const AuthenticatedUser = ({
  displayName,
  isUserMenuOpen,
  toggleUserMenu,
  userMenuRef,
  handleLogout,
  inTransition,
}) => (
  <div className="user-account" ref={userMenuRef}>
    <div
      className="user-account-trigger"
      onClick={toggleUserMenu}
      tabIndex="0"
      aria-label="Open user menu"
      aria-expanded={isUserMenuOpen}
      role="button"
      onKeyDown={(e) => e.key === "Enter" && toggleUserMenu()}
    >
      <span className="welcome-user">{displayName}</span>
      <img src={user_icon} alt="User" className="user-icon" />
    </div>
    <UserDropdown
      isOpen={isUserMenuOpen}
      onClose={() => toggleUserMenu(false)}
      handleLogout={handleLogout}
      inTransition={inTransition}
    />
  </div>
);

// Auth Buttons Component
const AuthButtons = ({ inTransition }) => (
  <div className="auth-buttons">
    <Link to="/login" onClick={(e) => inTransition && e.preventDefault()}>
      <button
        className="shop-nav-button login-btn"
        disabled={inTransition}
        aria-label="Login to your account"
      >
        Login
      </button>
    </Link>
    <Link to="/signup" onClick={(e) => inTransition && e.preventDefault()}>
      <button
        className="shop-nav-button signup-btn"
        disabled={inTransition}
        aria-label="Create a new account"
      >
        Signup
      </button>
    </Link>
  </div>
);

// Cart Component
const Cart = ({ inTransition }) => (
  <>
    <Link
      to="/cart"
      onClick={(e) => inTransition && e.preventDefault()}
      aria-label="View shopping cart"
    >
      <img className="cart-icon" src={cart_icon} alt="Shopping cart" />
    </Link>
    <CartCount />
  </>
);

const Navbar = () => {
  const { isAuthenticated, user, logout, inTransition } = useAuth();
  const [activeMenu, setActiveMenu] = useState("shop");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Update displayName whenever user changes
  useEffect(() => {
    if (!user) {
      setDisplayName("User");
      return;
    }

    setDisplayName(user.name || user.username || "User");
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = useCallback(
    (menuItem) => {
      // Early return if in transition
      if (inTransition) return;

      setActiveMenu(menuItem);
      setIsMobileMenuOpen(false); // Close mobile menu after selection
    },
    [inTransition]
  );

  const toggleUserMenu = useCallback(
    (forcedState) => {
      // Early return if in transition
      if (inTransition) return;

      setIsUserMenuOpen((prev) =>
        typeof forcedState === "boolean" ? forcedState : !prev
      );
    },
    [inTransition]
  );

  const handleLogout = useCallback(() => {
    // Early return if in transition
    if (inTransition) return;

    setIsUserMenuOpen(false); // Close user menu
    logout();
  }, [logout, inTransition]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <nav className="shop-navbar" role="navigation" aria-label="Main navigation">
      <NavLogo inTransition={inTransition} />

      <HamburgerMenu onClick={toggleMobileMenu} inTransition={inTransition} />

      <NavMenu
        activeMenu={activeMenu}
        handleMenuClick={handleMenuClick}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="shop-nav-login-cart">
        {isAuthenticated ? (
          <AuthenticatedUser
            displayName={displayName}
            isUserMenuOpen={isUserMenuOpen}
            toggleUserMenu={toggleUserMenu}
            userMenuRef={userMenuRef}
            handleLogout={handleLogout}
            inTransition={inTransition}
          />
        ) : (
          <AuthButtons inTransition={inTransition} />
        )}

        <Cart inTransition={inTransition} />
      </div>
    </nav>
  );
};

export default Navbar;
