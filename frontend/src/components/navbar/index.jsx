import React from "react";

// Internal Components
import {
  NavLogo,
  HamburgerMenu,
  NavMenu,
  AuthenticatedUser,
  AuthButtons,
  Cart,
} from "./components";

// Spinner component
import { InlineSpinner } from "../ui/spinner";

// Internal Hooks
import { useNavbarState } from "./hooks";

// Styles
import "./styles/index.css";

/**
 * Navbar component
 * @returns {JSX.Element} Navbar component
 */
const Navbar = () => {
  // Custom hook for navbar state management
  const {
    activeMenu,
    isMobileMenuOpen,
    displayName,
    isUserMenuOpen,
    userMenuRef,
    isAuthenticated,
    inTransition,
    handleMenuClick,
    toggleUserMenu,
    handleLogout,
    toggleMobileMenu,
  } = useNavbarState();

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <NavLogo inTransition={inTransition} />

      <HamburgerMenu onClick={toggleMobileMenu} inTransition={inTransition} />

      <NavMenu
        activeMenu={activeMenu}
        handleMenuClick={handleMenuClick}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="navbar-login-cart">
        {/* When in transition during logout, show the loading state without the username */}
        {inTransition ? (
          <div className="navbar-loading-state">
            <InlineSpinner size="small" />
            <span className="navbar-loading-text">Loading...</span>
          </div>
        ) : isAuthenticated ? (
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
