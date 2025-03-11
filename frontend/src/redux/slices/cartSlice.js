// frontend/src/redux/slices/cartSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API endpoints
const API_URL = "http://localhost:4000/api";

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return { items: [], totalItems: 0, totalPrice: 0 };

      const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch cart");
      }

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ itemId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId, quantity }),
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add item to cart");
      }

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add item to cart");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeItem",
  async ({ itemId, quantity = 1, removeAll = false }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/cart/remove`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId, quantity, removeAll }),
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(
          data.message || "Failed to remove item from cart"
        );
      }

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to remove item from cart"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/cart/update`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId, quantity }),
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update cart item");
      }

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update cart item");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to clear cart");
      }

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to clear cart");
    }
  }
);

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Create slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
        state.items = payload.items || [];
        state.totalItems = payload.totalItems || 0;
        state.totalPrice = payload.totalPrice || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cart";
      })

      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
        state.items = payload.items || [];
        state.totalItems = payload.totalItems || 0;
        state.totalPrice = payload.totalPrice || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add item to cart";
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
        state.items = payload.items || [];
        state.totalItems = payload.totalItems || 0;
        state.totalPrice = payload.totalPrice || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove item from cart";
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
        state.items = payload.items || [];
        state.totalItems = payload.totalItems || 0;
        state.totalPrice = payload.totalPrice || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update cart item";
      })

      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
