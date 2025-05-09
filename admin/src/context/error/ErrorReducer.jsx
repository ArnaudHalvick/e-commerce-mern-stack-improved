import {
  SET_ERROR,
  CLEAR_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_SUCCESS,
  CLEAR_SUCCESS,
} from "./ErrorTypes";

const ErrorReducer = (state, action) => {
  switch (action.type) {
    case SET_ERROR:
      return {
        ...state,
        error: {
          message: action.payload.message,
          details: action.payload.details,
          timestamp: new Date().toISOString(),
        },
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case SET_LOADING:
      return {
        ...state,
        loading:
          action.payload === "global"
            ? true
            : { ...state.loading, [action.payload]: true },
      };

    case CLEAR_LOADING:
      if (action.payload === "global") {
        return {
          ...state,
          loading: false,
        };
      } else {
        const newLoading = { ...state.loading };
        delete newLoading[action.payload];
        return {
          ...state,
          loading: Object.keys(newLoading).length > 0 ? newLoading : false,
        };
      }

    case SET_SUCCESS:
      return {
        ...state,
        success: {
          message: action.payload.message,
          data: action.payload.data,
          timestamp: new Date().toISOString(),
        },
      };

    case CLEAR_SUCCESS:
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};

export default ErrorReducer;
