// Path: frontend/src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../utils/apiUtils";

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(getApiUrl("profile"), userData, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        getApiUrl("change-password"),
        { currentPassword, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      // Return response data including the verification message
      return {
        ...response.data,
        passwordChangePending: true, // Flag to indicate password change is pending verification
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// Async thunk for disabling account
export const disableAccount = createAsyncThunk(
  "user/disableAccount",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        getApiUrl("disable-account"),
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to disable account"
      );
    }
  }
);

// Async thunk for requesting email verification
export const requestEmailVerification = createAsyncThunk(
  "user/requestVerification",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(getApiUrl("request-verification"), {
        email,
      });
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
        getApiUrl(`verify-email?token=${token}`)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify email"
      );
    }
  }
);

// Async thunk for verifying password change
export const verifyPasswordChange = createAsyncThunk(
  "user/verifyPasswordChange",
  async (token, { rejectWithValue }) => {
    try {
      const url = getApiUrl(`verify-password-change?token=${token}`);

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Password verification error:", error.response || error);

      // Check if there's a structured error response
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // Return tokenExpired flag if present
        if (errorData.tokenExpired) {
          return rejectWithValue({
            message:
              errorData.message ||
              "Token has expired. Please request a new password change.",
            tokenExpired: true,
          });
        }

        return rejectWithValue({
          message: errorData.message || "Failed to verify password change",
        });
      }

      return rejectWithValue({
        message: "Failed to verify password change. Please try again later.",
      });
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
    passwordChanged: false,
    passwordChangePending: false,
    accountDisabled: false,
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
      state.passwordChanged = false;
      state.passwordChangePending = false;
      state.accountDisabled = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPasswordChanged: (state) => {
      state.passwordChanged = false;
      state.passwordChangePending = false;
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
      // Handle changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordChanged = false;
        state.passwordChangePending = false;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordChanged = true;
        state.passwordChangePending =
          action.payload.passwordChangePending || false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.passwordChangePending = false;
      })
      // Handle disableAccount
      .addCase(disableAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disableAccount.fulfilled, (state) => {
        state.loading = false;
        state.accountDisabled = true;
        state.profile = null;
      })
      .addCase(disableAccount.rejected, (state, action) => {
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
      })
      // Handle verifyPasswordChange
      .addCase(verifyPasswordChange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasswordChange.fulfilled, (state) => {
        state.loading = false;
        state.passwordChanged = true;
        state.passwordChangePending = false;
      })
      .addCase(verifyPasswordChange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, clearError, resetPasswordChanged } =
  userSlice.actions;
export default userSlice.reducer;
