// Path: admin/src/components/navbar/Navbar.jsx
import { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import navlogo from "../../assets/admin_assets/nav-logo.svg";
import AuthContext from "../../context/auth/AuthContext";

const NavBar = ({ toggleSidebar, sidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      toggleSidebar();
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect happens automatically in AuthProvider
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          className="admin-navbar-toggle"
          onClick={toggleSidebar}
          onKeyDown={handleKeyDown}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          tabIndex="0"
        >
          <span
            className={`admin-navbar-hamburger ${sidebarOpen ? "open" : ""}`}
          >
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <img
          src={navlogo}
          alt="Admin Dashboard"
          className="admin-navbar-logo"
        />
      </div>

      <div className="admin-navbar-center">
        <h1 className="admin-navbar-title">Admin Dashboard</h1>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-navbar-profile" ref={dropdownRef}>
          <div
            className="admin-navbar-avatar"
            onClick={handleToggleDropdown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleToggleDropdown();
              }
            }}
            tabIndex="0"
            aria-label="Toggle profile dropdown"
          >
            <div className="admin-navbar-user-icon">👤</div>
            {user && <span className="admin-navbar-name">{user.name}</span>}
          </div>

          {dropdownOpen && (
            <div className="admin-navbar-dropdown">
              <ul>
                <li>
                  <a href="#profile" onClick={closeDropdown}>
                    My Profile
                  </a>
                </li>
                <li>
                  <a href="#settings" onClick={closeDropdown}>
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="admin-navbar-menu-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
