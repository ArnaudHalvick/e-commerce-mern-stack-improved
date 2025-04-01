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
  loginUser,
  registerUser,
  verifyToken,
  setInitialized,
  verifyPasswordChange,
  requestEmailChange,
  logoutUser,
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
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);
  const [lastVerificationCheck, setLastVerificationCheck] = useState(
    Date.now()
  );
  const [inTransition, setInTransition] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(
    userState.isInitialized
  );

  // Derive isUserLoggedOut from localStorage for consistency with existing code
  const [isUserLoggedOut, setIsUserLoggedOut] = useState(
    () => localStorage.getItem("user-logged-out") === "true"
  );

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    // Use the new logoutUser action which handles state updates and request cancellation properly
    dispatch(logoutUser());
    dispatch(resetCart());
    setIsUserLoggedOut(true);
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
    if (!userState.isInitialized) {
      checkAuthStatus();
    } else {
      setInitialLoadComplete(true);
    }
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

  // Listen for email verification required events
  useEffect(() => {
    const handleEmailVerificationRequired = (event) => {
      const { message } = event.detail;

      // If already on verification page, don't navigate
      if (window.location.pathname.includes("/verify")) {
        return;
      }

      // Show a notification or handle as needed
      if (
        window.confirm(
          `${message} Would you like to go to the verification page?`
        )
      ) {
        navigate("/verify-pending", {
          state: {
            from: window.location.pathname,
            requiresVerification: true,
          },
        });
      }
    };

    window.addEventListener(
      "auth:emailVerificationRequired",
      handleEmailVerificationRequired
    );

    return () => {
      window.removeEventListener(
        "auth:emailVerificationRequired",
        handleEmailVerificationRequired
      );
    };
  }, [navigate]);

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
    const token = localStorage.getItem("auth-token");

    if (!token || isUserLoggedOut) {
      dispatch(clearUser());
      dispatch(setInitialized(true));
      setInitialLoadComplete(true);
      return;
    }

    if (token) {
      localStorage.removeItem("user-logged-out");
      setIsUserLoggedOut(false);
    }

    try {
      const resultAction = await dispatch(verifyToken());

      if (verifyToken.fulfilled.match(resultAction)) {
        // Token is valid, user is authenticated
        await fetchUserProfile();
      } else {
        // Token is invalid, handle error
        const errorPayload = resultAction.payload;

        if (errorPayload === "Your account has been disabled") {
          // Handle disabled account
        } else if (
          resultAction.error &&
          resultAction.error.message &&
          resultAction.error.message.includes("401")
        ) {
          // Token expired, try to refresh
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
    } finally {
      setInitialLoadComplete(true);
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
    try {
      setInTransition(true);
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        // Login successful
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);

        await fetchUserProfile();
        return { success: true, user: resultAction.payload };
      } else {
        // Login failed
        return {
          success: false,
          message: resultAction.payload || "Login failed. Please try again.",
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Login failed. Please try again.",
      };
    } finally {
      setInTransition(false);
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      setInTransition(true);
      localStorage.removeItem("user-logged-out");

      const resultAction = await dispatch(registerUser(userData));

      if (registerUser.fulfilled.match(resultAction)) {
        setIsUserLoggedOut(false);

        try {
          const userProfile = await fetchUserProfile();

          if (userProfile) {
            return {
              success: true,
              user: userProfile,
              requiresVerification: userProfile.status === "unverified",
            };
          }
        } catch (profileError) {
          console.error("Error fetching profile after signup:", profileError);
        }

        // Registration successful
        return {
          success: true,
          user: resultAction.payload.user,
          requiresVerification: resultAction.payload.needsVerification,
        };
      } else {
        // Registration failed
        return {
          success: false,
          message:
            resultAction.payload || "Registration failed. Please try again.",
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Registration failed. Please try again.",
      };
    } finally {
      setInTransition(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = useCallback(() => {
    setInTransition(true);

    authService
      .logout()
      .catch(console.error)
      .finally(() => {
        handleLogout();
        setInTransition(false);
        navigate("/");
      });
  }, [handleLogout, navigate]);

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  const updateProfile = (userData) => {
    return dispatch(updateUserProfile(userData));
  };

  return {
    // User state
    user: userState.user,
    isAuthenticated: userState.isAuthenticated,
    loading: userState.loading || inTransition,
    error: userState.error,
    accountDisabled: userState.accountDisabled,
    isEmailVerified: userState.isEmailVerified,
    initialLoadComplete,
    inTransition,
    isUserLoggedOut,

    // Auth status indicators
    verificationRequested: userState.verificationRequested,
    emailChangeRequested: userState.emailChangeRequested,
    passwordChanged: userState.passwordChanged,
    passwordChangePending: userState.passwordChangePending,

    // Authentication methods
    login,
    signup: register,
    logout,
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
    verifyPasswordChange: (token) => dispatch(verifyPasswordChange(token)),
    requestEmailChange: (email) => dispatch(requestEmailChange(email)),
  };
};

export default useAuth;
