// Path: frontend/src/components/navbar/Navbar.jsx

import "./Navbar.css";

import logo from "../assets/logo.png";
import cart_icon from "../assets/cart_icon.png";

import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { ShopContext } from "../../context/ShopContext";

const Navbar = () => {
  const { getTotalCartItems } = useContext(ShopContext);
  const [activeMenu, setActiveMenu] = useState("shop");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        {localStorage.getItem("auth-token") ? (
          <button
            onClick={() => {
              localStorage.removeItem("auth-token");
              window.location.reload();
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
        <Link to="/cart">
          <img src={cart_icon} alt="cart" />
        </Link>
        <div className="shop-nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
