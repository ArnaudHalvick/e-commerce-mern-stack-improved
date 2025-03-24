// frontend/src/context/AuthContext.jsx

import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetCart } from "../redux/slices/cartSlice";
import { setUser, clearUser } from "../redux/slices/userSlice";
import { API_BASE_URL } from "../utils/apiUtils";
import axios from "axios";
import { cancelPendingRequests as cancelApiRequests } from "../services/apiClient";
import { cancelPendingRequests as cancelAxiosRequests } from "../utils/axiosConfig";

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);
  const [isUserLoggedOut, setIsUserLoggedOut] = useState(
    () => localStorage.getItem("user-logged-out") === "true"
  );
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sync isUserLoggedOut with localStorage
  useEffect(() => {
    const isLoggedOut = localStorage.getItem("user-logged-out") === "true";
    setIsUserLoggedOut(isLoggedOut);
  }, []);

  // Helper function to normalize user data
  const normalizeUserData = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      username: userData.name || userData.username,
    };
  };

  // Handle auth logout - Extracted to be used in multiple places
  const handleLogout = useCallback(() => {
    localStorage.removeItem("auth-token");
    localStorage.setItem("user-logged-out", "true");
    setUserState(null);
    setIsAuthenticated(false);
    setIsUserLoggedOut(true); // Set flag to prevent refresh attempts after logout
    setAccountDisabled(false); // Reset account disabled flag
    dispatch(resetCart());
    dispatch(clearUser());
  }, [dispatch]);

  // Listen for token refresh failures
  useEffect(() => {
    const handleTokenRefreshFailure = () => {
      handleLogout();
      // Optional: redirect to login page or show notification
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
  }, [handleLogout, navigate]);

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    if (tokenRefreshInProgress || isUserLoggedOut) return null;

    try {
      setTokenRefreshInProgress(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/users/refresh-token`,
        {},
        { withCredentials: true } // Important to include cookies
      );

      if (response.data && response.data.success) {
        // Store the new access token
        localStorage.setItem("auth-token", response.data.accessToken);
        return response.data.accessToken;
      }

      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // If refresh fails, clear auth state
      handleLogout();
      return null;
    } finally {
      setTokenRefreshInProgress(false);
    }
  }, [tokenRefreshInProgress, handleLogout, isUserLoggedOut]);

  // Memoized fetchUserProfile function
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        credentials: "include", // Include cookies for refresh token
      });

      // If unauthorized, try to refresh the token and retry
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with the new token
          const retryResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": newToken,
            },
            credentials: "include",
          });

          const retryData = await retryResponse.json();
          if (retryResponse.ok && retryData.success) {
            const normalizedUser = normalizeUserData(retryData.user);
            setUserState(normalizedUser);
            dispatch(setUser(normalizedUser));
            setIsAuthenticated(true);
            return normalizedUser;
          }
        }
        return null;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        const normalizedUser = normalizeUserData(data.user);
        setUserState(normalizedUser);
        dispatch(setUser(normalizedUser));
        setIsAuthenticated(true);
        return normalizedUser;
      }

      return null;
    } catch (err) {
      console.error("Fetch profile error:", err);
      return null;
    }
  }, [dispatch, refreshAccessToken]);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem("auth-token");

      // Skip token refresh if user is logged out or no token exists
      if (!token || isUserLoggedOut) {
        setIsAuthenticated(false);
        setUserState(null);
        dispatch(clearUser());
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      try {
        // Use the current token to verify with backend
        const response = await fetch(`${API_BASE_URL}/api/users/verify-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          credentials: "include", // Include cookies for refresh token
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const normalizedUser = normalizeUserData(data.user);
          setUserState(normalizedUser);
          dispatch(setUser(normalizedUser));
          setIsAuthenticated(true);
          setAccountDisabled(false);

          // Fetch complete profile data
          await fetchUserProfile();
        } else {
          // If token verification failed but it's not a 401, handle specific errors
          if (
            response.status === 403 &&
            data.message === "Your account has been disabled"
          ) {
            setAccountDisabled(true);
            setError("Your account has been disabled. Please contact support.");
          } else if (response.status === 401) {
            // Only attempt to refresh token if not logged out
            if (!isUserLoggedOut) {
              const newToken = await refreshAccessToken();
              if (newToken) {
                // If refresh successful, retry auth check
                await checkAuthStatus();
                return;
              }
            }
          }

          // If we reach here, auth failed or refresh failed
          handleLogout();
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        handleLogout();
        if (
          err.message === "Failed to fetch" ||
          err.message.includes("Network")
        ) {
          // Optionally handle network errors
        } else {
          setError("Authentication verification failed");
        }
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    checkAuthStatus();
  }, [
    dispatch,
    fetchUserProfile,
    refreshAccessToken,
    handleLogout,
    isUserLoggedOut,
  ]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setAccountDisabled(false);
    // Clear logout flag on login attempt
    localStorage.removeItem("user-logged-out");
    setIsUserLoggedOut(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important to include cookies
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("auth-token", data.accessToken);
        const normalizedUser = normalizeUserData(data.user);
        setUserState(normalizedUser);
        dispatch(setUser(normalizedUser));
        setIsAuthenticated(true);

        // Fetch complete profile data
        await fetchUserProfile();

        navigate("/");
        return { success: true };
      } else {
        if (
          response.status === 403 &&
          (data.message === "Your account has been disabled" ||
            data.message ===
              "Your account is disabled. Please contact support.")
        ) {
          setAccountDisabled(true);
          setError("Your account has been disabled. Please contact support.");
          return {
            success: false,
            message: data.message,
            accountDisabled: true,
          };
        }
        setError(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      return { success: false, message: "Login failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Make sure we're passing the passwordConfirm property that backend expects
      const signupData = {
        ...userData,
        passwordConfirm: userData.passwordConfirm,
      };

      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
        credentials: "include", // Include cookies
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.requiresVerification) {
          localStorage.setItem("auth-token", data.accessToken);
          const normalizedUser = normalizeUserData(data.user);
          setUserState(normalizedUser);
          dispatch(setUser(normalizedUser));
          setIsAuthenticated(true);
        }
        return {
          success: true,
          requiresVerification: data.requiresVerification,
          email: data.email,
          message: data.message,
        };
      } else {
        setError(data.message || "Signup failed");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
      return { success: false, message: "Signup failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    // First set logged out flag to prevent new authenticated requests
    setIsUserLoggedOut(true);
    localStorage.setItem("user-logged-out", "true");

    // Cancel all pending requests to prevent 401 errors
    cancelApiRequests("User logged out");
    cancelAxiosRequests("User logged out");

    try {
      // Call backend logout endpoint to clear refresh token cookie
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        credentials: "include", // Include cookies
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API success
      handleLogout();
      navigate("/");
    }
  };

  if (!initialLoadComplete) {
    // Return nothing or a minimal loader until initial auth check is complete
    return <div style={{ display: "none" }}></div>;
  }

  // Context value
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    accountDisabled,
    login,
    signup,
    logout,
    fetchUserProfile,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
