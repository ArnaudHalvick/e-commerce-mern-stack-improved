// Path: frontend/src/components/navbar/Navbar.jsx

import "./Navbar.css";

import logo from "../assets/logo.png";
import cart_icon from "../assets/cart_icon.png";
import user_icon from "../assets/user_icon.png";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/state";
import CartCount from "./CartCount";

const Navbar = () => {
  const { isAuthenticated, user, logout, inTransition } = useAuth();
  const [activeMenu, setActiveMenu] = useState("shop");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Update displayName whenever user changes
  useEffect(() => {
    if (user) {
      // Check for both name and username properties since backend uses 'name'
      setDisplayName(user.name || user.username || "User");
    } else {
      setDisplayName("User");
    }
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

  const handleMenuClick = (menuItem) => {
    // Prevent menu click during authentication transition
    if (inTransition) return;

    setActiveMenu(menuItem);
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    // Prevent toggle during authentication transition
    if (inTransition) return;

    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Simple logout handler
  const handleLogout = useCallback(() => {
    // Prevent multiple logout attempts
    if (inTransition) return;

    setIsUserMenuOpen(false); // Close user menu
    logout();
  }, [logout, inTransition]);

  return (
    <div className="shop-navbar">
      <Link
        to="/"
        className="shop-nav-logo"
        onClick={(e) => inTransition && e.preventDefault()}
      >
        <img src={logo} alt="logo" />
        <p className="shop-nav-logo-text">SHOPPER</p>
      </Link>

      {/* Hamburger Icon for Mobile */}
      <div
        className="hamburger"
        onClick={() => !inTransition && setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </div>

      <ul className={`shop-nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <li
          className="shop-nav-menu-item"
          onClick={() => handleMenuClick("shop")}
        >
          <Link to="/">
            Home{" "}
            {activeMenu === "shop" && (
              <hr className="shop-nav-menu-indicator" />
            )}
          </Link>
        </li>
        <li
          className="shop-nav-menu-item"
          onClick={() => handleMenuClick("men")}
        >
          <Link to="/men">
            Men{" "}
            {activeMenu === "men" && <hr className="shop-nav-menu-indicator" />}
          </Link>
        </li>
        <li
          className="shop-nav-menu-item"
          onClick={() => handleMenuClick("women")}
        >
          <Link to="/women">
            Women{" "}
            {activeMenu === "women" && (
              <hr className="shop-nav-menu-indicator" />
            )}
          </Link>
        </li>
        <li
          className="shop-nav-menu-item"
          onClick={() => handleMenuClick("kids")}
        >
          <Link to="/kids">
            Kids{" "}
            {activeMenu === "kids" && (
              <hr className="shop-nav-menu-indicator" />
            )}
          </Link>
        </li>
        <li
          className="shop-nav-menu-item"
          onClick={() => handleMenuClick("offers")}
        >
          <Link to="/offers">
            Shop{" "}
            {activeMenu === "offers" && (
              <hr className="shop-nav-menu-indicator" />
            )}
          </Link>
        </li>
      </ul>

      <div className="shop-nav-login-cart">
        {isAuthenticated ? (
          <div className="user-account" ref={userMenuRef}>
            <div className="user-account-trigger" onClick={toggleUserMenu}>
              <span className="welcome-user">{displayName}</span>
              <img src={user_icon} alt="User" className="user-icon" />
            </div>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <Link
                  to="/profile"
                  className="user-dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/account/orders"
                  className="user-dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  to="/cart"
                  className="user-dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  My Cart
                </Link>
                <button
                  className="user-dropdown-button"
                  onClick={handleLogout}
                  disabled={inTransition}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link
              to="/login"
              onClick={(e) => inTransition && e.preventDefault()}
            >
              <button
                className="shop-nav-button login-btn"
                disabled={inTransition}
              >
                Login
              </button>
            </Link>
            <Link
              to="/signup"
              onClick={(e) => inTransition && e.preventDefault()}
            >
              <button
                className="shop-nav-button signup-btn"
                disabled={inTransition}
              >
                Signup
              </button>
            </Link>
          </div>
        )}
        <Link to="/cart" onClick={(e) => inTransition && e.preventDefault()}>
          <img className="cart-icon" src={cart_icon} alt="cart" />
        </Link>
        <CartCount />
      </div>
    </div>
  );
};

export default Navbar;
