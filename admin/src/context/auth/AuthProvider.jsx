import { useReducer, useEffect } from "react";
import AuthContext from "./AuthContext";
import AuthReducer from "./AuthReducer";
import authService from "../../api/services/authService";

// Action types
import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  AUTH_ERROR,
  CLEAR_AUTH_ERROR,
  USER_LOADED,
  AUTH_LOADING,
  REFRESH_TOKEN,
} from "./AuthTypes";

const AuthProvider = ({ children }) => {
  // Initial state
  const initialState = {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // Check if user is authenticated on load
  useEffect(() => {
    const loadUser = async () => {
      // If no token in localStorage, don't bother checking
      if (!authService.isAuthenticated()) {
        dispatch({ type: AUTH_ERROR });
        return;
      }

      try {
        // Verify the token is valid
        const response = await authService.verifyAuth();

        if (response.success) {
          dispatch({
            type: USER_LOADED,
            payload: response.user,
          });
        } else {
          dispatch({ type: AUTH_ERROR });
        }
      } catch (error) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.message || "Authentication failed",
        });
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (formData) => {
    dispatch({ type: AUTH_LOADING });

    try {
      const response = await authService.login(formData);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: response.user,
          accessToken: response.accessToken,
        },
      });

      return true;
    } catch (error) {
      // Use the server's error message if available, which will now contain
      // the generic "Invalid email or password" message for auth failures
      // Fall back to a default message if no response from server
      const errorMessage = error.message || "Invalid email or password";

      // Log the error for debugging (can be removed in production)
      console.error("Login error:", errorMessage);

      dispatch({
        type: LOGIN_FAIL,
        payload: errorMessage,
      });

      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Error during logout, but we'll continue with the local logout process
    }

    // Dispatch logout action to clear auth state
    dispatch({ type: LOGOUT });

    // Construct the login page URL
    const loginPath = "/login";

    // Use replace instead of href to avoid adding to history
    // This helps prevent redirect loops
    window.location.replace(loginPath);
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: CLEAR_AUTH_ERROR });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
