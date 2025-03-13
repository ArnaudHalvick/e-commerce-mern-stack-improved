// Path: frontend/src/components/navbar/Navbar.jsx

import "./Navbar.css";

import logo from "../assets/logo.png";
import cart_icon from "../assets/cart_icon.png";
import user_icon from "../assets/user_icon.png";

import { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import CartCount from "./CartCount";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
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
    setActiveMenu(menuItem);
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="shop-navbar">
      <Link to="/" className="shop-nav-logo">
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </Link>

      {/* Hamburger Icon for Mobile */}
      <div
        className="hamburger"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`shop-nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <li onClick={() => handleMenuClick("shop")}>
          <Link to="/">Home {activeMenu === "shop" && <hr />}</Link>
        </li>
        <li onClick={() => handleMenuClick("men")}>
          <Link to="/men">Men {activeMenu === "men" && <hr />}</Link>
        </li>
        <li onClick={() => handleMenuClick("women")}>
          <Link to="/women">Women {activeMenu === "women" && <hr />}</Link>
        </li>
        <li onClick={() => handleMenuClick("kids")}>
          <Link to="/kids">Kids {activeMenu === "kids" && <hr />}</Link>
        </li>
        <li onClick={() => handleMenuClick("offers")}>
          <Link to="/offers">Shop {activeMenu === "offers" && <hr />}</Link>
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
                <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                  My Profile
                </Link>
                <Link to="/cart" onClick={() => setIsUserMenuOpen(false)}>
                  My Cart
                </Link>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
        <Link to="/cart">
          <img className="cart-icon" src={cart_icon} alt="cart" />
        </Link>
        <CartCount />
      </div>
    </div>
  );
};

export default Navbar;
