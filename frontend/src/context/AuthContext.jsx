import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetCart } from "../redux/slices/cartSlice";
import { setUser, clearUser } from "../redux/slices/userSlice";
import { API_BASE_URL } from "../utils/imageUtils";

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountDisabled, setAccountDisabled] = useState(false);

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
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const normalizedUser = normalizeUserData(data.user);
        setUserState(normalizedUser);
        dispatch(setUser(normalizedUser));
        return normalizedUser;
      }

      return null;
    } catch (err) {
      console.error("Fetch profile error:", err);
      return null;
    }
  }, [dispatch]);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem("auth-token");

      if (!token) {
        setIsAuthenticated(false);
        setUserState(null);
        dispatch(clearUser());
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/api/verify-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          const normalizedUser = normalizeUserData(data.user);
          setUserState(normalizedUser);
          dispatch(setUser(normalizedUser));
          setIsAuthenticated(true);
          setAccountDisabled(false);

          // Fetch complete profile data
          await fetchUserProfile();
        } else {
          if (
            response.status === 403 &&
            data.message === "Your account has been disabled"
          ) {
            setAccountDisabled(true);
            setError("Your account has been disabled. Please contact support.");
          }
          localStorage.removeItem("auth-token");
          setIsAuthenticated(false);
          setUserState(null);
          dispatch(clearUser());
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        if (
          err.message === "Failed to fetch" ||
          err.message.includes("Network")
        ) {
          // Optionally handle network errors
        } else {
          localStorage.removeItem("auth-token");
          setIsAuthenticated(false);
          setUserState(null);
          dispatch(clearUser());
          setError("Authentication verification failed");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch, fetchUserProfile]);

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
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
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
  const logout = () => {
    localStorage.removeItem("auth-token");
    setUserState(null);
    setIsAuthenticated(false);
    dispatch(resetCart());
    dispatch(clearUser());
    navigate("/");
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
