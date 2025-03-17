// frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import userReducer from "./slices/userSlice";
import reviewsReducer from "./slices/reviewsSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    reviews: reviewsReducer,
  },
});

export default store;
