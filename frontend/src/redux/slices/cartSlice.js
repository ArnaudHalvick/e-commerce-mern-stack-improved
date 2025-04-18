// frontend/src/redux/slices/cartSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "../../api";

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
      const data = await cartService.getCart();

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
  async ({ itemId, quantity = 1, size }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Ensure size is valid
      if (!size) {
        return rejectWithValue("Size is required");
      }

      // Use API service with simplified parameters
      const data = await cartService.addToCart({
        itemId,
        quantity,
        size,
      });

      if (data && data.cart) {
        return data.cart;
      }

      return { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      console.error("Add to cart error:", error);

      // Return current state to avoid UI flicker
      const { cart } = getState();
      return cart;
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeItem",
  async (
    { itemId, quantity = 1, removeAll = false, size },
    { rejectWithValue, getState }
  ) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Ensure size is valid
      if (!size) {
        return rejectWithValue("Size is required");
      }

      // Use API service with simplified parameters
      const data = await cartService.removeFromCart({
        itemId,
        quantity,
        removeAll,
        size,
      });

      if (data && data.cart) {
        return data.cart;
      }

      return { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      console.error("Remove from cart error:", error);

      // Return current state to avoid UI flicker
      const { cart } = getState();
      return cart;
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity, size }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      // Ensure size is valid
      if (!size) {
        return rejectWithValue("Size is required");
      }

      // Use API service with simplified parameters
      const data = await cartService.updateCartItem({
        itemId,
        quantity,
        size,
      });

      if (data && data.cart) {
        return data.cart;
      }

      return { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      console.error("Update cart item error:", error);

      // Return current state to avoid UI flicker
      const { cart } = getState();
      return cart;
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
      const data = await cartService.clearCart();

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
  pendingOperations: {}, // Track pending operations by item ID and size
};

// Create slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
    // Add a reducer to mark an operation as pending
    markOperationPending: (state, action) => {
      const { itemId, size, operation } = action.payload;
      const key = `${itemId}-${size}-${operation}`;
      state.pendingOperations[key] = true;
    },
    // Add a reducer to mark an operation as completed
    markOperationCompleted: (state, action) => {
      const { itemId, size, operation } = action.payload;
      const key = `${itemId}-${size}-${operation}`;
      delete state.pendingOperations[key];
    },
    // Clear any cart-related errors without affecting the cart state
    clearError: (state) => {
      state.error = null;
    },
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

        // Only update the state if we got new data from the server
        // This helps prevent flickering
        if (action.payload && (!action.payload.error || action.payload.items)) {
          const payload = action.payload || {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          };
          state.items = payload.items || [];
          state.totalItems = payload.totalItems || 0;
          state.totalPrice = payload.totalPrice || 0;
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add item to cart";
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

        // Only update if we got valid data back
        if (action.payload && (!action.payload.error || action.payload.items)) {
          const payload = action.payload || {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          };
          state.items = payload.items || [];
          state.totalItems = payload.totalItems || 0;
          state.totalPrice = payload.totalPrice || 0;
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove item from cart";
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state, action) => {
        // Optimistic update
        const { itemId, quantity, size } = action.meta.arg;
        const existingItem = state.items.find(
          (item) => item.productId === itemId && item.size === size
        );

        if (existingItem) {
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

        // Only update if we got valid data back
        if (action.payload && (!action.payload.error || action.payload.items)) {
          const payload = action.payload || {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          };
          state.items = payload.items || [];
          state.totalItems = payload.totalItems || 0;
          state.totalPrice = payload.totalPrice || 0;
          state.lastUpdated = new Date().toISOString();
        }
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
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.pendingOperations = {};
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const {
  resetCart,
  markOperationPending,
  markOperationCompleted,
  clearError,
} = cartSlice.actions;
export default cartSlice.reducer;
