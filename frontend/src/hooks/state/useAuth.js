import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  setUser,
  clearUser,
  updateUserProfile,
  changePassword,
  disableAccount,
  requestEmailVerification,
  verifyEmail,
} from "../../redux/slices/userSlice";
import { resetCart } from "../../redux/slices/cartSlice";
import { authService } from "../../api";
import { cancelPendingRequests } from "../../api/client";

/**
 * Custom hook for authentication and user management
 * Provides an interface for all auth-related operations and state
 */
const useAuth = () => {
  // Access Redux state and dispatch
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Local state for auth-specific UI states
  const [loading, setLoading] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [lastVerificationCheck, setLastVerificationCheck] = useState(
    Date.now()
  );

  // Derive isUserLoggedOut from localStorage for consistency with existing code
  const [isUserLoggedOut, setIsUserLoggedOut] = useState(
    () => localStorage.getItem("user-logged-out") === "true"
  );

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("auth-token");
    localStorage.setItem("user-logged-out", "true");
    cancelPendingRequests("User initiated logout");
    dispatch(clearUser());
    dispatch(resetCart());
    setIsUserLoggedOut(true);
    setAccountDisabled(false);
  }, [dispatch]);

  /**
   * Normalize user data to ensure consistent structure
   * @param {Object} userData - User data from API
   * @returns {Object} Normalized user data
   */
  const normalizeUserData = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      username: userData.name || userData.username,
    };
  };

  /**
   * Fetch current user profile
   * @returns {Promise<Object|null>} User profile or null
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        const normalizedUser = normalizeUserData(response.user);
        dispatch(setUser(normalizedUser));
        setLastVerificationCheck(Date.now());
        return normalizedUser;
      }
      return null;
    } catch (err) {
      console.error("Fetch profile error:", err);
      return null;
    }
  }, [dispatch]);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check localStorage logged out state
  useEffect(() => {
    const isLoggedOut = localStorage.getItem("user-logged-out") === "true";
    setIsUserLoggedOut(isLoggedOut);
    if (isLoggedOut && localStorage.getItem("auth-token")) {
      localStorage.removeItem("auth-token");
    }
  }, []);

  // Check user verification on cart/checkout navigation
  useEffect(() => {
    if (userState.isAuthenticated && userState.user) {
      // Only refresh if it's been more than 30 seconds since the last check
      const timeSinceLastCheck = Date.now() - lastVerificationCheck;
      const requiresRefresh = timeSinceLastCheck > 30000; // 30 seconds

      // Check if we're on a page that requires a fresh verification check
      const isCartOrCheckout =
        location.pathname === "/cart" ||
        location.pathname === "/checkout" ||
        location.pathname.startsWith("/order-confirmation");

      if (isCartOrCheckout && requiresRefresh) {
        // Refresh the user profile to check verification status
        fetchUserProfile();
        setLastVerificationCheck(Date.now());
      }
    }
  }, [
    location.pathname,
    userState.isAuthenticated,
    userState.user,
    lastVerificationCheck,
    fetchUserProfile,
  ]);

  // Listen for token refresh failures
  useEffect(() => {
    const handleTokenRefreshFailure = () => {
      handleLogout();
      navigate("/login", {
        state: {
          from: window.location.pathname,
          message: "Your session has expired. Please log in again.",
        },
      });
    };

    window.addEventListener(
      "auth:tokenRefreshFailed",
      handleTokenRefreshFailure
    );
    return () => {
      window.removeEventListener(
        "auth:tokenRefreshFailed",
        handleTokenRefreshFailure
      );
    };
  }, [navigate, handleLogout]);

  /**
   * Refresh the access token
   * @returns {Promise<string|null>} New token or null
   */
  const refreshAccessToken = useCallback(async () => {
    if (tokenRefreshInProgress || isUserLoggedOut) return null;
    try {
      setTokenRefreshInProgress(true);
      const response = await authService.refreshToken();
      if (response && response.success) {
        localStorage.setItem("auth-token", response.accessToken);
        return response.accessToken;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      handleLogout();
      return null;
    } finally {
      setTokenRefreshInProgress(false);
    }
  }, [tokenRefreshInProgress, isUserLoggedOut, handleLogout]);

  /**
   * Check authentication status
   * @returns {Promise<void>}
   */
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("auth-token");

    if (!token || isUserLoggedOut) {
      dispatch(clearUser());
      setLoading(false);
      setIsAuthInitialized(true);
      return;
    }

    if (token) {
      localStorage.removeItem("user-logged-out");
      setIsUserLoggedOut(false);
    }

    try {
      const response = await authService.verifyToken();

      if (response && response.success) {
        const normalizedUser = normalizeUserData(response.user);
        dispatch(setUser(normalizedUser));
        await fetchUserProfile();
        setAccountDisabled(false);
      } else {
        if (response && response.message === "Your account has been disabled") {
          setAccountDisabled(true);
          setError("Your account has been disabled. Please contact support.");
        } else if (response && response.status === 401) {
          if (!isUserLoggedOut) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              await checkAuthStatus();
              return;
            }
          }
        }
        handleLogout();
      }
    } catch (err) {
      console.error("Auth verification error:", err);
      handleLogout();
      if (
        err.message !== "Failed to fetch" &&
        !err.message.includes("Network")
      ) {
        setError("Authentication verification failed");
      }
    } finally {
      setLoading(false);
      setIsAuthInitialized(true);
    }
  }, [
    dispatch,
    fetchUserProfile,
    refreshAccessToken,
    isUserLoggedOut,
    handleLogout,
  ]);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        localStorage.setItem("auth-token", response.token);
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);

        const normalizedUser = normalizeUserData(response.user);
        dispatch(setUser(normalizedUser));

        await fetchUserProfile();
        return { success: true, user: normalizedUser };
      } else {
        setError(response.message || "Login failed");
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);

      if (response.success) {
        localStorage.setItem("auth-token", response.token);
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);

        const normalizedUser = normalizeUserData(response.user);
        dispatch(setUser(normalizedUser));

        return { success: true, user: normalizedUser, needsVerification: true };
      } else {
        setError(response.message || "Registration failed");
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    authService.logout().catch(console.error);
    handleLogout();
  };

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  const updateProfile = (userData) => {
    return dispatch(updateUserProfile(userData));
  };

  return {
    // State
    user: userState.user,
    isAuthenticated: userState.isAuthenticated,
    loading: loading || userState.loading,
    error: error || userState.error,
    accountDisabled,
    isAuthInitialized,

    // Authentication methods
    login,
    logout,
    register,
    refreshAccessToken,

    // User profile methods
    fetchUserProfile,
    updateProfile,
    changePassword: (passwordData) => dispatch(changePassword(passwordData)),
    disableAccount: (password) => dispatch(disableAccount(password)),

    // Verification methods
    requestEmailVerification: (email) =>
      dispatch(requestEmailVerification(email)),
    verifyEmail: (token) => dispatch(verifyEmail(token)),
  };
};

export default useAuth;
