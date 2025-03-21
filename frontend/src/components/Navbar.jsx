import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
// ... other imports ...

const Navbar = () => {
  const { isAuthenticated, loading, user, logout } = useContext(AuthContext);
  // ... other code ...

  // Don't render auth-related links until loading is complete
  const renderAuthSection = () => {
    if (loading) {
      // Return empty div with same height as auth buttons to prevent layout shift
      return (
        <div
          className="auth-placeholder"
          style={{ width: "180px", height: "40px" }}
        ></div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="user-menu">
          <span className="welcome-user">Welcome, {user?.name || "User"}</span>
          <Link to="/profile">Profile</Link>
          <button onClick={logout}>Logout</button>
          {/* ... other authenticated user links ... */}
        </div>
      );
    }

    return (
      <div className="auth-links">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    );
  };

  return (
    <nav className="shop-navbar">
      {/* ... logo and other navbar items ... */}

      <div className="shop-nav-login-cart">
        {renderAuthSection()}
        {/* ... cart icon and other items ... */}
      </div>
    </nav>
  );
};

export default Navbar;
