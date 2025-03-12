// frontend/src/redux/slices/cartSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "../../services/api";

// API endpoints
const API_URL = "http://localhost:4000/api";

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return { items: [], totalItems: 0, totalPrice: 0 };

      // Use API service
      const data = await cartApi.getCart();

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : "Failed to fetch cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ itemId, quantity = 1, size }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Use API service
      const data = await cartApi.addToCart({ itemId, quantity, size });

      return data.cart;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : "Failed to add item to cart"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeItem",
  async (
    { itemId, quantity = 1, removeAll = false, size },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Use API service
      const data = await cartApi.removeFromCart({
        itemId,
        quantity,
        removeAll,
        size,
      });

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : "Failed to remove item from cart"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity, size }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Use API service
      const data = await cartApi.updateCartItem({ itemId, quantity, size });

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : "Failed to update cart item"
      );
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

      // Use API service
      const data = await cartApi.clearCart();

      return data.cart || { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : "Failed to clear cart"
      );
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
      .addCase(addToCart.pending, (state, action) => {
        // Optimistic update - find the item and increment its quantity
        const { itemId, quantity, size } = action.meta.arg;
        const existingItem = state.items.find(
          (item) => item.productId === itemId && item.size === size
        );

        if (existingItem) {
          // Item exists, update quantity
          existingItem.quantity += quantity;
        }

        // Recalculate totals
        const { totalItems, totalPrice } = calculateCartTotals(state.items);
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;

        // Set loading state but don't block UI
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
        // Revert optimistic update by fetching the cart again
        // This is a simple approach - a more complex one would save the previous state
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state, action) => {
        // Optimistic update
        const { itemId, quantity, removeAll, size } = action.meta.arg;

        if (removeAll) {
          // Remove the item completely
          state.items = state.items.filter(
            (item) => !(item.productId === itemId && item.size === size)
          );
        } else {
          // Find the item and decrement its quantity
          const existingItem = state.items.find(
            (item) => item.productId === itemId && item.size === size
          );

          if (existingItem) {
            existingItem.quantity = Math.max(
              0,
              existingItem.quantity - quantity
            );

            // If quantity is 0, remove the item
            if (existingItem.quantity === 0) {
              state.items = state.items.filter(
                (item) => !(item.productId === itemId && item.size === size)
              );
            }
          }
        }

        // Recalculate totals
        const { totalItems, totalPrice } = calculateCartTotals(state.items);
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;

        // Set loading state but don't block UI
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
        // Revert optimistic update by fetching the cart again
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state, action) => {
        // Optimistic update
        const { itemId, quantity, size } = action.meta.arg;
        const existingItem = state.items.find(
          (item) => item.productId === itemId && item.size === size
        );

        if (existingItem) {
          // Store the old quantity for potential rollback
          const oldQuantity = existingItem.quantity;

          // Update the quantity
          existingItem.quantity = quantity;

          // Recalculate totals
          const { totalItems, totalPrice } = calculateCartTotals(state.items);
          state.totalItems = totalItems;
          state.totalPrice = totalPrice;
        }

        // Set loading state but don't block UI
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
        // Revert optimistic update by fetching the cart again
      })

      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
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
