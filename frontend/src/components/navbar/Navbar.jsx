// Path: frontend/src/components/navbar/Navbar.jsx

import "./Navbar.css";

import logo from "../assets/logo.png";
import cart_icon from "../assets/cart_icon.png";

import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import CartCount from "./CartCount";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState("shop");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  // Update displayName whenever user changes
  useEffect(() => {
    if (user) {
      // Check for both name and username properties since backend uses 'name'
      setDisplayName(user.name || user.username || "User");
    } else {
      setDisplayName("User");
    }
  }, [user]);

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="shop-navbar">
      <div className="shop-nav-logo">
        <img src={logo} alt="logo" />
        <p>SHOPSITE</p>
      </div>

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
          <Link to="/">Shop {activeMenu === "shop" && <hr />}</Link>
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
      </ul>

      <div className="shop-nav-login-cart">
        {isAuthenticated ? (
          <>
            <span className="welcome-user">Hi, {displayName}</span>
            <div className="user-controls">
              <button onClick={logout}>Logout</button>
            </div>
          </>
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
