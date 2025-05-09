// Path: admin/src/components/navbar/Navbar.jsx
import { useState } from "react";
import "./Navbar.css";
import navlogo from "../../assets/admin_assets/nav-logo.svg";
import navProfile from "../../assets/admin_assets/nav-profile.svg";

const NavBar = ({ toggleSidebar, sidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      toggleSidebar();
    }
  };

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          className="admin-sidebar-toggle"
          onClick={toggleSidebar}
          onKeyDown={handleKeyDown}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          tabIndex="0"
        >
          <span className={`hamburger-icon ${sidebarOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <img src={navlogo} alt="Admin Dashboard" className="admin-logo" />
      </div>

      <div className="admin-navbar-center">
        <h1 className="admin-navbar-title">Admin Dashboard</h1>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-navbar-profile">
          <div
            className="admin-profile-avatar"
            onClick={handleToggleDropdown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleToggleDropdown();
              }
            }}
            tabIndex="0"
            aria-label="Toggle profile dropdown"
          >
            <img src={navProfile} alt="Profile" />
          </div>

          {dropdownOpen && (
            <div className="admin-profile-dropdown">
              <ul>
                <li>
                  <a href="#profile">My Profile</a>
                </li>
                <li>
                  <a href="#settings">Settings</a>
                </li>
                <li>
                  <a href="#logout">Logout</a>
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
