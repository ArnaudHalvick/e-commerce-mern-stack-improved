import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetCart } from "../redux/slices/cartSlice";
import { setUser, clearUser } from "../redux/slices/userSlice";
import { API_BASE_URL } from "../utils/apiUtils";
import axios from "axios";

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    setUserState(null);
    setIsAuthenticated(false);
    dispatch(resetCart());
    dispatch(clearUser());
  }, [dispatch]);

  // Listen for token refresh failures
  useEffect(() => {
    const handleTokenRefreshFailure = () => {
      console.log("Token refresh failed event received");
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
    if (tokenRefreshInProgress) return null;

    try {
      setTokenRefreshInProgress(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/refresh-token`,
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
  }, [tokenRefreshInProgress, handleLogout]);

  // Memoized fetchUserProfile function
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/me`, {
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
          const retryResponse = await fetch(`${API_BASE_URL}/api/me`, {
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

      if (!token) {
        // Even if we don't have a token in localStorage, try to refresh
        const newToken = await refreshAccessToken();
        if (!newToken) {
          setIsAuthenticated(false);
          setUserState(null);
          dispatch(clearUser());
          setLoading(false);
          return;
        }

        // If we got a new token, continue with it
      }

      try {
        // Use the current token (either from localStorage or newly refreshed)
        const currentToken = localStorage.getItem("auth-token");

        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/api/verify-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": currentToken,
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
            // If unauthorized, try to refresh the token
            const newToken = await refreshAccessToken();
            if (newToken) {
              // If refresh successful, retry auth check
              await checkAuthStatus();
              return;
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
      }
    };

    checkAuthStatus();
  }, [dispatch, fetchUserProfile, refreshAccessToken, handleLogout]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setAccountDisabled(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
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
          data.message === "Your account has been disabled"
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

      const response = await fetch(`${API_BASE_URL}/api/signup`, {
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
    try {
      // Call backend logout endpoint to clear refresh token cookie
      await fetch(`${API_BASE_URL}/api/logout`, {
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
