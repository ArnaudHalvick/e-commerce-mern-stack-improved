import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  AUTH_LOADING,
  AUTH_ERROR,
  CLEAR_AUTH_ERROR,
  USER_LOADED,
  REFRESH_TOKEN,
} from "./AuthTypes";

const AuthReducer = (state, action) => {
  switch (action.type) {
    case AUTH_LOADING:
      return {
        ...state,
        loading: true,
      };

    case USER_LOADED:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case LOGIN_SUCCESS:
      // Store tokens in localStorage
      localStorage.setItem("accessToken", action.payload.accessToken);

      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        error: null,
      };

    case REFRESH_TOKEN:
      // Update access token
      localStorage.setItem("accessToken", action.payload);

      return {
        ...state,
        loading: false,
      };

    case LOGIN_FAIL:
    case AUTH_ERROR:
      // Clear localStorage on auth failure
      localStorage.removeItem("accessToken");

      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };

    case CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };

    case LOGOUT:
      // Clear localStorage on logout
      localStorage.removeItem("accessToken");

      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

export default AuthReducer;
