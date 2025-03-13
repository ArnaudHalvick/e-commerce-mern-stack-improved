import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetCart } from "../redux/slices/cartSlice";
import { setUser, clearUser } from "../redux/slices/userSlice";

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Helper function to normalize user data
  const normalizeUserData = (userData) => {
    if (!userData) return null;

    // Ensure we have a username property (backend uses 'name')
    return {
      ...userData,
      username: userData.name || userData.username,
    };
  };

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
        const response = await fetch("http://localhost:4000/api/verify-token", {
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
        } else {
          // Token is invalid
          localStorage.removeItem("auth-token");
          setIsAuthenticated(false);
          setUserState(null);
          dispatch(clearUser());
          // Don't show error for normal auth flow
          setError(null);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        // If it's a network error or server issue, don't logout user immediately
        // This prevents logout on temporary network issues
        if (
          err.message === "Failed to fetch" ||
          err.message.includes("Network")
        ) {
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
  }, [dispatch]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/api/login", {
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
        navigate("/");
        return { success: true };
      } else {
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
      const response = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("auth-token", data.accessToken);
        const normalizedUser = normalizeUserData(data.user);
        setUserState(normalizedUser);
        dispatch(setUser(normalizedUser));
        setIsAuthenticated(true);
        navigate("/");
        return { success: true };
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
    // Reset cart state when user logs out
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
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
