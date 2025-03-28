// frontend/src/context/AuthContext.jsx

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
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
  const [inTransition, setInTransition] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sync isUserLoggedOut with localStorage on mount
  useEffect(() => {
    const isLoggedOut = localStorage.getItem("user-logged-out") === "true";
    setIsUserLoggedOut(isLoggedOut);
    console.log("AuthContext init - isUserLoggedOut:", isLoggedOut);
    if (isLoggedOut && localStorage.getItem("auth-token")) {
      console.log("Found token but user marked as logged out - clearing token");
      localStorage.removeItem("auth-token");
    }
  }, []);

  // Helper to normalize user data
  const normalizeUserData = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      username: userData.name || userData.username,
    };
  };

  // Handle logout logic
  const handleLogout = useCallback(() => {
    console.log("Logout - Clearing auth state");
    localStorage.removeItem("auth-token");
    localStorage.setItem("user-logged-out", "true");
    cancelApiRequests("User initiated logout");
    cancelAxiosRequests("User initiated logout");
    setUserState(null);
    setIsAuthenticated(false);
    setIsUserLoggedOut(true);
    setAccountDisabled(false);
    dispatch(resetCart());
    dispatch(clearUser());
    console.log("Logout - Auth state cleared, user-logged-out flag set");
  }, [dispatch]);

  // Listen for token refresh failures and handle logout
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
  }, [handleLogout, navigate]);

  // Refresh the access token
  const refreshAccessToken = useCallback(async () => {
    if (tokenRefreshInProgress || isUserLoggedOut) return null;
    try {
      setTokenRefreshInProgress(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/users/refresh-token`,
        {},
        { withCredentials: true }
      );
      if (response.data && response.data.success) {
        localStorage.setItem("auth-token", response.data.accessToken);
        return response.data.accessToken;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      handleLogout();
      return null;
    } finally {
      setTokenRefreshInProgress(false);
    }
  }, [tokenRefreshInProgress, handleLogout, isUserLoggedOut]);

  // Memoized function to fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return null;

      let response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        credentials: "include",
      });

      // If unauthorized, attempt token refresh and retry
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          response = await fetch(`${API_BASE_URL}/api/users/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": newToken,
            },
            credentials: "include",
          });
          const retryData = await response.json();
          if (response.ok && retryData.success) {
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

  // Check authentication status on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem("auth-token");

      console.log("CheckAuthStatus - Token exists:", !!token);
      console.log("CheckAuthStatus - isUserLoggedOut flag:", isUserLoggedOut);

      if (!token || isUserLoggedOut) {
        console.log(
          "CheckAuthStatus - Skipping auth check (no token or logged out)"
        );
        setIsAuthenticated(false);
        setUserState(null);
        dispatch(clearUser());
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      // Reset logged-out flag if token is present
      if (token) {
        console.log(
          "CheckAuthStatus - Resetting isUserLoggedOut flag due to token presence"
        );
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);
      }

      try {
        console.log("CheckAuthStatus - Verifying token with backend");
        const response = await fetch(`${API_BASE_URL}/api/users/verify-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          credentials: "include",
        });

        const data = await response.json();
        console.log(
          "CheckAuthStatus - Token verification response:",
          response.status,
          data.success
        );

        if (response.ok && data.success) {
          const normalizedUser = normalizeUserData(data.user);
          setUserState(normalizedUser);
          dispatch(setUser(normalizedUser));
          setIsAuthenticated(true);
          setAccountDisabled(false);
          console.log(
            "CheckAuthStatus - User authenticated:",
            normalizedUser.email
          );
          await fetchUserProfile();
        } else {
          if (
            response.status === 403 &&
            data.message === "Your account has been disabled"
          ) {
            setAccountDisabled(true);
            setError("Your account has been disabled. Please contact support.");
          } else if (response.status === 401) {
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
    setInTransition(true);

    console.log("Login - Attempting login for:", email);
    localStorage.removeItem("user-logged-out");
    setIsUserLoggedOut(false);
    console.log("Login - Reset isUserLoggedOut flag");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      console.log(
        "Login - Response status:",
        response.status,
        "success:",
        data.success
      );

      if (response.ok && data.success) {
        localStorage.setItem("auth-token", data.accessToken);
        console.log("Login - Auth token stored");
        const normalizedUser = normalizeUserData(data.user);
        console.log("Login - User authenticated:", normalizedUser.email);
        const updateAndNavigate = () => {
          setUserState(normalizedUser);
          dispatch(setUser(normalizedUser));
          setIsAuthenticated(true);
          setLoading(false);
          setTimeout(() => {
            setInTransition(false);
            navigate("/");
          }, 300);
        };
        fetchUserProfile().finally(updateAndNavigate);
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
          setInTransition(false);
          setLoading(false);
          return {
            success: false,
            message: data.message,
            accountDisabled: true,
          };
        }
        setError(data.message || "Login failed");
        setInTransition(false);
        setLoading(false);
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setInTransition(false);
      setLoading(false);
      return {
        success: false,
        message: err.message || "Login failed. Please try again.",
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    setInTransition(true);
    try {
      const signupData = {
        ...userData,
        passwordConfirm: userData.passwordConfirm,
      };
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.requiresVerification) {
          localStorage.setItem("auth-token", data.accessToken);
          const normalizedUser = normalizeUserData(data.user);
          setTimeout(() => {
            setUserState(normalizedUser);
            dispatch(setUser(normalizedUser));
            setIsAuthenticated(true);
            setInTransition(false);
          }, 300);
        } else {
          setInTransition(false);
        }
        setLoading(false);
        return {
          success: true,
          requiresVerification: data.requiresVerification,
          email: data.email,
          message: data.message,
        };
      } else {
        setError(data.message || "Signup failed");
        setInTransition(false);
        setLoading(false);
        return { success: false, message: data.message || "Signup failed" };
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
      setInTransition(false);
      setLoading(false);
      return {
        success: false,
        message: err.message || "Signup failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    setInTransition(true);
    setIsUserLoggedOut(true);
    localStorage.setItem("user-logged-out", "true");
    setIsAuthenticated(false);
    setUserState(null);
    dispatch(clearUser());
    dispatch(resetCart());
    localStorage.removeItem("auth-token");
    cancelApiRequests("User logged out");
    cancelAxiosRequests("User logged out");

    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setTimeout(() => {
        setInTransition(false);
        navigate("/");
      }, 300);
    }
  };

  if (!initialLoadComplete) {
    return <div style={{ display: "none" }}></div>;
  }

  const contextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    accountDisabled,
    initialLoadComplete,
    inTransition,
    isUserLoggedOut,
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

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContextProvider;
