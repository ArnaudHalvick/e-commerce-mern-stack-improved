import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../hooks/state";
import { useLocation } from "react-router-dom";

// Navigation menu items
export const NAV_ITEMS = [
  { id: "home", label: "Home", path: "/" },
  { id: "men", label: "Men", path: "/men" },
  { id: "women", label: "Women", path: "/women" },
  { id: "kids", label: "Kids", path: "/kids" },
  { id: "shop", label: "Shop", path: "/shop" },
];

/**
 * Custom hook for navbar state management
 * @returns {Object} Navbar state and handlers
 */
const useNavbarState = () => {
  const { isAuthenticated, user, logout, inTransition } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();

  // Update activeMenu based on current path
  useEffect(() => {
    const pathname = location.pathname;

    // Find matching nav item or set to null if not found
    const matchedItem = NAV_ITEMS.find((item) => {
      // Exact path match
      if (item.path === pathname) {
        return true;
      }

      // Special case for home (root path)
      if (item.id === "home" && pathname === "/") {
        return true;
      }

      return false;
    });

    setActiveMenu(matchedItem ? matchedItem.id : null);
  }, [location.pathname]);

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

    // Close user menu
    setIsUserMenuOpen(false);

    // Call logout (which now sets inTransition internally)
    logout();
  }, [logout, inTransition]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return {
    // State
    activeMenu,
    isMobileMenuOpen,
    displayName,
    isUserMenuOpen,
    userMenuRef,
    isAuthenticated,
    inTransition,

    // Handlers
    handleMenuClick,
    toggleUserMenu,
    handleLogout,
    toggleMobileMenu,
  };
};

export default useNavbarState;
