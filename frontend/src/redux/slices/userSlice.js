import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        `${API_BASE_URL}/api/profile`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Async thunk for requesting email verification
export const requestEmailVerification = createAsyncThunk(
  "user/requestVerification",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/request-verification`,
        { email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request verification"
      );
    }
  }
);

// Async thunk for verifying email
export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/verify-email?token=${token}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify email"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    isEmailVerified: false,
    verificationRequested: false,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.profile = action.payload;
      state.isEmailVerified = action.payload?.isEmailVerified || false;
    },
    clearUser: (state) => {
      state.profile = null;
      state.isEmailVerified = false;
      state.verificationRequested = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle requestEmailVerification
      .addCase(requestEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state) => {
        state.verificationRequested = true;
        state.loading = false;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle verifyEmail
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isEmailVerified = true;
        state.loading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;
