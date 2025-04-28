import { useState, useEffect, useCallback, useRef } from "react";
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
  requestEmailChange,
  logoutUser,
} from "../../redux/slices/userSlice";
import { resetCart } from "../../redux/slices/cartSlice";
import { authService } from "../../api";
import { cancelPendingRequests } from "../../api/client";
import useErrorRedux from "../../hooks/useErrorRedux";

// Constants for local storage keys
const CACHED_USER_KEY = "cached-user-data";
const CACHED_USER_TIMESTAMP = "cached-user-timestamp";
const USER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

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
  const { showError } = useErrorRedux();

  // Local state for auth-specific UI states
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);
  const [lastVerificationCheck, setLastVerificationCheck] = useState(
    Date.now()
  );
  const [inTransition, setInTransition] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(
    userState.isInitialized
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [quietLoading, setQuietLoading] = useState(false);

  // Add refs at the top level of the hook
  const hasInitialized = useRef(false);
  const lastFetchTime = useRef(0);
  const prevPathname = useRef(location.pathname);

  // Derive isUserLoggedOut from localStorage for consistency with existing code
  const [isUserLoggedOut, setIsUserLoggedOut] = useState(
    () => localStorage.getItem("user-logged-out") === "true"
  );

  /**
   * Store user data in local storage cache
   * @param {Object} userData - User data to cache
   */
  const cacheUserData = useCallback((userData) => {
    if (!userData) return;

    try {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(CACHED_USER_TIMESTAMP, Date.now().toString());
    } catch (error) {
      // Silent error - caching is a performance optimization, not critical
    }
  }, []);

  /**
   * Get cached user data if it's still valid
   * @returns {Object|null} Cached user data or null if invalid/expired
   */
  const getCachedUserData = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHED_USER_KEY);
      const timestamp = parseInt(
        localStorage.getItem(CACHED_USER_TIMESTAMP) || "0",
        10
      );

      if (!cachedData) return null;

      // Check if cache is still valid (not expired)
      if (Date.now() - timestamp > USER_CACHE_TTL) {
        localStorage.removeItem(CACHED_USER_KEY);
        localStorage.removeItem(CACHED_USER_TIMESTAMP);
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      // If any error occurs, clear the cache and return null
      localStorage.removeItem(CACHED_USER_KEY);
      localStorage.removeItem(CACHED_USER_TIMESTAMP);
      return null;
    }
  }, []);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    setInTransition(true);
    setIsInitialLoad(false);

    // Cancel all pending requests before logging out
    cancelPendingRequests("User logged out");

    // Clear user cache
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem(CACHED_USER_TIMESTAMP);

    // Add a small delay to ensure the loading indicator is visible during logout
    setTimeout(() => {
      // Use the redux action to properly update the state and persist logout
      dispatch(logoutUser());
      dispatch(resetCart());
      setIsUserLoggedOut(true);
      setInTransition(false);
    }, 800); // Short delay to show the loading indicator
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
    // Don't try to fetch profile if there's no token or user is logged out
    const token = localStorage.getItem("auth-token");
    const isLoggedOut = localStorage.getItem("user-logged-out") === "true";
    const now = Date.now();
    const MIN_FETCH_INTERVAL = 5000; // 5 seconds minimum between fetches

    if (
      !token ||
      isLoggedOut ||
      now - lastFetchTime.current < MIN_FETCH_INTERVAL
    ) {
      return userState.user; // Return current user instead of null to prevent state thrashing
    }

    lastFetchTime.current = now;

    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        const normalizedUser = normalizeUserData(response.user);
        // Only dispatch if user data has actually changed
        if (JSON.stringify(normalizedUser) !== JSON.stringify(userState.user)) {
          dispatch(setUser(normalizedUser));
          // Cache the user data for faster page refreshes
          cacheUserData(normalizedUser);
        }
        setLastVerificationCheck(now);
        return normalizedUser;
      }
      return userState.user; // Return current user on non-error failures
    } catch (err) {
      // Only log the error if it's not a 401 Unauthorized
      if (err.status !== 401) {
        // Use redux for error handling instead of console logging in production
        showError("Failed to load user profile.");
      }

      // If unauthorized, clear the token and mark as logged out
      if (err.status === 401) {
        localStorage.removeItem("auth-token");
        localStorage.setItem("user-logged-out", "true");
        localStorage.removeItem(CACHED_USER_KEY);
        localStorage.removeItem(CACHED_USER_TIMESTAMP);
        dispatch(clearUser());
      }

      return null;
    }
  }, [dispatch, showError, userState.user, cacheUserData]);

  // Initialize auth state on mount
  useEffect(() => {
    if (!userState.isInitialized && !hasInitialized.current) {
      hasInitialized.current = true;

      // Try to use cached data immediately to make the UI render faster
      const cachedUser = getCachedUserData();
      if (cachedUser && localStorage.getItem("auth-token")) {
        // Set user from cache immediately to prevent UI flicker
        dispatch(setUser(cachedUser));
        // Still verify the token in the background, but don't block the UI
        setQuietLoading(true);
        checkAuthStatus(true);
      } else {
        // No cached data, perform normal auth check
        checkAuthStatus(false);
      }
    } else {
      setInitialLoadComplete(true);
      // If already initialized, mark initial load as complete
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to clear isInitialLoad when initialization is complete
  useEffect(() => {
    if (userState.isInitialized && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [userState.isInitialized, isInitialLoad]);

  // Check localStorage logged out state and sync with Redux
  useEffect(() => {
    const isLoggedOut = localStorage.getItem("user-logged-out") === "true";

    // If the user is marked as logged out but still authenticated in state, clear the auth state
    if (isLoggedOut && userState.isAuthenticated) {
      dispatch(clearUser());
    }

    setIsUserLoggedOut(isLoggedOut);

    // Ensure token is removed if logged out
    if (isLoggedOut && localStorage.getItem("auth-token")) {
      localStorage.removeItem("auth-token");
    }
  }, [userState.isAuthenticated, dispatch]);

  // Check user verification on cart/checkout navigation
  useEffect(() => {
    if (userState.isAuthenticated && userState.user) {
      // Only refresh if it's been more than 30 seconds since the last check
      const timeSinceLastCheck = Date.now() - lastVerificationCheck;
      const requiresRefresh = timeSinceLastCheck > 30000; // 30 seconds

      // Check if we're on a page that requires a fresh verification check AND pathname has changed
      const isCartOrCheckout =
        location.pathname === "/cart" ||
        location.pathname === "/checkout" ||
        location.pathname.startsWith("/order-confirmation");

      const pathnameChanged = prevPathname.current !== location.pathname;
      prevPathname.current = location.pathname;

      if (isCartOrCheckout && requiresRefresh && pathnameChanged) {
        // Refresh the user profile to check verification status
        setQuietLoading(true); // Use quiet loading for better UX
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
    // Don't try to refresh if it's already in progress or user is logged out
    if (tokenRefreshInProgress) return null;

    try {
      setTokenRefreshInProgress(true);
      const response = await authService.refreshToken();

      if (response && response.success) {
        // Save new token and remove logged-out flag
        localStorage.setItem("auth-token", response.accessToken);
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);
        return response.accessToken;
      }
      return null;
    } catch (error) {
      // Silent handling is appropriate here - no need for console.error
      handleLogout();
      return null;
    } finally {
      setTokenRefreshInProgress(false);
    }
  }, [tokenRefreshInProgress, handleLogout]);

  /**
   * Check authentication status
   * @param {boolean} quietMode - Whether to use quiet loading (no full screen overlay)
   * @returns {Promise<void>}
   */
  const checkAuthStatus = useCallback(
    async (quietMode = false) => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        dispatch(clearUser());
        dispatch(setInitialized(true));
        setInitialLoadComplete(true);
        return;
      }

      // Reset logged-out flag if token exists
      localStorage.removeItem("user-logged-out");
      setIsUserLoggedOut(false);

      try {
        // Only show the transition overlay if not in quiet mode
        if (!quietMode) {
          setInTransition(true);
        }

        // Dispatch the verifyToken action
        const resultAction = await dispatch(verifyToken());

        if (verifyToken.fulfilled.match(resultAction)) {
          // Token is valid, user is authenticated
          // The user data is already loaded via the verifyToken action
          const userData = resultAction.payload;

          // Cache the user data for faster future loads
          cacheUserData(userData);

          // In quiet mode, we don't need to fetch the full profile again
          // This prevents double-loading and improves performance
          if (!quietMode) {
            await fetchUserProfile();
          }
        } else {
          // Token verification failed, attempt to refresh
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              // If we got a new token, try to get the user data again
              const userData = await fetchUserProfile();
              if (userData) {
                cacheUserData(userData);
              }
            } else {
              // If refresh failed too, log the user out
              if (!quietMode) {
                showError("Your session has expired. Please log in again.");
              }
              handleLogout();
            }
          } catch (refreshError) {
            // Silent handling for refresh errors
            handleLogout();
          }
        }
      } catch (error) {
        // Use error handling through Redux
        if (!quietMode) {
          showError("Authentication error. Please log in again.");
        }
        handleLogout();
      } finally {
        setInTransition(false);
        setQuietLoading(false);
        dispatch(setInitialized(true));
        setInitialLoadComplete(true);
        // After initial check, set isInitialLoad to false
        setIsInitialLoad(false);
      }
    },
    [
      dispatch,
      fetchUserProfile,
      handleLogout,
      refreshAccessToken,
      showError,
      cacheUserData,
    ]
  );

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      setInTransition(true);
      setIsInitialLoad(false);
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        // Login successful
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);

        const userData = await fetchUserProfile();
        if (userData) {
          cacheUserData(userData);
        }

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
            cacheUserData(userProfile);
            return {
              success: true,
              user: userProfile,
              requiresVerification: userProfile.status === "unverified",
            };
          }
        } catch (profileError) {
          // Silent handling - the user is already registered
        }

        // Registration successful
        const user = resultAction.payload.user;
        cacheUserData(user);

        return {
          success: true,
          user: user,
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
    setIsInitialLoad(false);

    // Clear user cache
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem(CACHED_USER_TIMESTAMP);

    authService
      .logout()
      .catch(() => {
        // Silent catch - we're logging out anyway
      })
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
    isInitialLoad,
    quietLoading,

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
    requestEmailChange: (email) => dispatch(requestEmailChange(email)),
  };
};

export default useAuth;
