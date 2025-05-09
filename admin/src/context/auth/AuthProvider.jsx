import { useReducer, useEffect } from "react";
import AuthContext from "./AuthContext";
import AuthReducer from "./AuthReducer";
import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  AUTH_LOADING,
  AUTH_ERROR,
  CLEAR_AUTH_ERROR,
  USER_LOADED,
  LOGOUT,
} from "./AuthTypes";
import authService from "../../api/services/authService";

const AuthProvider = ({ children }) => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      // Check if token exists in localStorage
      if (!authService.isAuthenticated()) {
        dispatch({ type: AUTH_ERROR });
        return;
      }

      try {
        const response = await authService.verifyAuth();

        if (response.success) {
          dispatch({
            type: USER_LOADED,
            payload: response.user,
          });
        } else {
          dispatch({ type: AUTH_ERROR });
        }
      } catch (err) {
        dispatch({
          type: AUTH_ERROR,
          payload: err.message || "Authentication failed",
        });
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (credentials) => {
    dispatch({ type: AUTH_LOADING });

    try {
      const data = await authService.login(credentials);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: data.user,
          accessToken: data.accessToken,
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
      await authService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }

    dispatch({ type: LOGOUT });
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
