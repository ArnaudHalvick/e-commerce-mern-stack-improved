// frontend/src/context/AuthContext.jsx

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetCart } from "../redux/slices/cartSlice";
import { setUser, clearUser } from "../redux/slices/userSlice";
import { API_BASE_URL } from "../api/config";
import axios from "axios";
import { cancelPendingRequests } from "../api/client";
import { authService } from "../api";

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
  const [lastVerificationCheck, setLastVerificationCheck] = useState(
    Date.now()
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const isLoggedOut = localStorage.getItem("user-logged-out") === "true";
    setIsUserLoggedOut(isLoggedOut);
    if (isLoggedOut && localStorage.getItem("auth-token")) {
      localStorage.removeItem("auth-token");
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        const normalizedUser = normalizeUserData(response.user);
        setUserState(normalizedUser);
        dispatch(setUser(normalizedUser));
        setIsAuthenticated(true);
        setLastVerificationCheck(Date.now());
        return normalizedUser;
      }
      return null;
    } catch (err) {
      console.error("Fetch profile error:", err);
      return null;
    }
  }, [dispatch]);

  // Check user profile when navigating to /cart or /checkout
  useEffect(() => {
    if (isAuthenticated && user) {
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
    isAuthenticated,
    user,
    fetchUserProfile,
    lastVerificationCheck,
  ]);

  const normalizeUserData = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      username: userData.name || userData.username,
    };
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("auth-token");
    localStorage.setItem("user-logged-out", "true");
    cancelPendingRequests("User initiated logout");
    setUserState(null);
    setIsAuthenticated(false);
    setIsUserLoggedOut(true);
    setAccountDisabled(false);
    dispatch(resetCart());
    dispatch(clearUser());
  }, [dispatch]);

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

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem("auth-token");

      if (!token || isUserLoggedOut) {
        setIsAuthenticated(false);
        setUserState(null);
        dispatch(clearUser());
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      if (token) {
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/verify-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const normalizedUser = normalizeUserData(data.user);
          setUserState(normalizedUser);
          dispatch(setUser(normalizedUser));
          setIsAuthenticated(true);
          setAccountDisabled(false);
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
          err.message !== "Failed to fetch" &&
          !err.message.includes("Network")
        ) {
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

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      // Make sure we're sending valid data if we're using credentials
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Get the authentication result from the API
      response = await authService.login(email.trim(), password.trim());

      if (response && response.success) {
        // Successful login, store token and update auth state
        const { accessToken, user } = response;
        localStorage.setItem("auth-token", accessToken);
        localStorage.removeItem("user-logged-out");
        setIsUserLoggedOut(false);

        const normalizedUser = normalizeUserData(user);
        setUserState(normalizedUser);
        dispatch(setUser(normalizedUser));
        setIsAuthenticated(true);
        setAccountDisabled(false);

        setLoading(false);
        return user;
      } else {
        // Handle unsuccessful login
        setError(response?.message || "Login failed");
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.fieldErrors?.email ||
          err.fieldErrors?.password ||
          err.message ||
          "Login failed. Please try again."
      );
      setLoading(false);
      throw err;
    }
  };

  const signup = async (userData) => {
    setInTransition(true);
    localStorage.removeItem("user-logged-out");

    try {
      const response = await authService.register(userData);

      if (response.success) {
        localStorage.setItem("auth-token", response.token);
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
      }

      return response;
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: error.message || "Registration failed. Please try again.",
      };
    } finally {
      setInTransition(false);
    }
  };

  const logout = async () => {
    setInTransition(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(resetCart());
      localStorage.removeItem("auth-token");
      localStorage.setItem("user-logged-out", "true");
      cancelPendingRequests("User logged out");

      setUserState(null);
      setIsAuthenticated(false);
      setIsUserLoggedOut(true);
      setAccountDisabled(false);
      dispatch(clearUser());
      setInTransition(false);

      // Return to home page
      navigate("/");
    }
  };

  // Add an event listener for email verification required events
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
