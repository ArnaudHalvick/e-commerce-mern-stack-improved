import { useReducer, useEffect } from "react";
import AuthContext from "./AuthContext";
import AuthReducer from "./AuthReducer";
import { auth } from "../../api/services";

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
      if (!auth.isAuthenticated()) {
        dispatch({ type: AUTH_ERROR });
        return;
      }

      try {
        // Verify the token is valid
        const response = await auth.verifyAuth();

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
      const response = await auth.login(formData);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: response.user,
          accessToken: response.accessToken,
        },
      });

      return true;
    } catch (error) {
      dispatch({
        type: LOGIN_FAIL,
        payload: error.message || "Invalid email or password",
      });

      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }

    dispatch({ type: LOGOUT });

    // When using React Router with a basename, we need to respect the router's
    // context for navigation. When logging out, we want to do a fresh page load
    // to clear all state, so we use window.location.href.

    // The URL structure should be:
    // https://domain.com/admin/login
    // where /admin is the basename and /login is the route

    // Use window.location.origin to get the base URL
    const origin = window.location.origin;

    // Get basePath from runtime config or default to '/admin'
    const basePath =
      window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.basePath
        ? window.RUNTIME_CONFIG.basePath
        : "/admin";

    // Normalize the path to not have trailing slash
    const normalizedBasePath = basePath.endsWith("/")
      ? basePath.slice(0, -1)
      : basePath;

    // Redirect to login with proper fully qualified URL
    window.location.href = `${origin}${normalizedBasePath}/login`;
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
