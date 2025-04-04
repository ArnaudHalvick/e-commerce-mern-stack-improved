// frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import userReducer, { verifyToken } from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";
import reviewsReducer from "./slices/reviewsSlice";
import errorReducer from "./slices/errorSlice";

// Create the store with our reducers
const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    reviews: reviewsReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Initialize authentication state on app startup
const initializeAuthState = () => {
  const token = localStorage.getItem("auth-token");
  if (token && localStorage.getItem("user-logged-out") !== "true") {
    // Token exists and user isn't marked as logged out, verify it
    store.dispatch(verifyToken());
  }
};

// Call the initialization function
initializeAuthState();

export default store;
