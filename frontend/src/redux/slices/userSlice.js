// Path: frontend/src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../utils/apiUtils";

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      // Debug the userData, especially for address updates
      console.log(
        "Profile update - data being sent to server:",
        JSON.stringify(userData, null, 2)
      );

      const token = localStorage.getItem("auth-token");
      const response = await axios.put(getApiUrl("users/profile"), userData, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      // Debug the response
      console.log(
        "Profile update - server response:",
        JSON.stringify(response.data, null, 2)
      );

      // Check for success flag in the response
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Profile update failed"
        );
      }

      // Return the user data from the response
      return response.data.user;
    } catch (error) {
      // Log the error for debugging
      console.error("Profile update error:", error.response || error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        // Format validation errors from express-validator
        const validationErrors = {};
        error.response.data.errors.forEach((err) => {
          validationErrors[err.param] = err.msg;
        });

        return rejectWithValue({
          message: error.response?.data?.message || "Failed to update profile",
          validationErrors,
        });
      }

      // Check for specific error types in the response
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }

      // Generic error message
      return rejectWithValue("Failed to update profile. Please try again.");
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (
    { currentPassword, newPassword, confirmPassword },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        getApiUrl("users/change-password"),
        {
          currentPassword,
          newPassword,
          newPasswordConfirm: confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      // Return response data
      return {
        ...response.data,
        passwordChanged: true,
      };
    } catch (error) {
      // Handle validation errors from express-validator
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach((err) => {
          // Map backend field names to frontend field names
          const fieldName =
            err.param === "newPasswordConfirm" ? "confirmPassword" : err.param;
          validationErrors[fieldName] = err.msg;
        });

        return rejectWithValue({
          message: error.response?.data?.message || "Failed to change password",
          validationErrors,
        });
      }

      // Handle specific error cases
      if (error.response?.data?.message?.includes("current password")) {
        return rejectWithValue({
          message: error.response?.data?.message,
          validationErrors: {
            currentPassword: "Current password is incorrect",
          },
        });
      }

      // Generic error
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to change password",
      });
    }
  }
);

// Async thunk for disabling account
export const disableAccount = createAsyncThunk(
  "user/disableAccount",
  async (password, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        getApiUrl("users/disable-account"),
        { password },
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
      const response = await axios.post(
        getApiUrl("users/request-verification"),
        {
          email,
        }
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
        getApiUrl(`users/verify-email?token=${token}`)
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
      const url = getApiUrl(`users/verify-password-change?token=${token}`);

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

// Async thunk for requesting email change
export const requestEmailChange = createAsyncThunk(
  "user/requestEmailChange",
  async (email, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.post(
        getApiUrl("users/change-email"),
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      // Handle error responses
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Failed to send email change verification");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    isEmailVerified: false,
    verificationRequested: false,
    emailChangeRequested: false,
    loading: false,
    loadingStates: {
      verifyingEmail: false,
      sendingVerification: false,
      disablingAccount: false,
      changingPassword: false,
      updatingProfile: false,
      changingEmail: false,
    },
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
      state.emailChangeRequested = false;
      state.passwordChanged = false;
      state.passwordChangePending = false;
      state.accountDisabled = false;
      state.loading = false;
      state.loadingStates = {
        verifyingEmail: false,
        sendingVerification: false,
        disablingAccount: false,
        changingPassword: false,
        updatingProfile: false,
        changingEmail: false,
      };
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
        state.loadingStates.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
        state.loadingStates.updatingProfile = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.updatingProfile = false;
        state.error = action.payload;
      })
      // Handle changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.loadingStates.changingPassword = true;
        state.error = null;
        state.passwordChanged = false;
        state.passwordChangePending = false;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingStates.changingPassword = false;
        state.passwordChanged = true;
        state.passwordChangePending = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.changingPassword = false;
        state.error = action.payload;
        state.passwordChangePending = false;
      })
      // Handle disableAccount
      .addCase(disableAccount.pending, (state) => {
        state.loading = true;
        state.loadingStates.disablingAccount = true;
        state.error = null;
      })
      .addCase(disableAccount.fulfilled, (state) => {
        state.loading = false;
        state.loadingStates.disablingAccount = false;
        state.accountDisabled = true;
        state.profile = null;
      })
      .addCase(disableAccount.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.disablingAccount = false;
        state.error = action.payload;
      })
      // Handle requestEmailVerification
      .addCase(requestEmailVerification.pending, (state) => {
        state.loading = true;
        state.loadingStates.sendingVerification = true;
        state.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state) => {
        state.verificationRequested = true;
        state.loading = false;
        state.loadingStates.sendingVerification = false;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.sendingVerification = false;
        state.error = action.payload;
      })
      // Handle verifyEmail
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.loadingStates.verifyingEmail = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isEmailVerified = true;
        state.loading = false;
        state.loadingStates.verifyingEmail = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.verifyingEmail = false;
        state.error = action.payload;
      })
      // Handle verifyPasswordChange
      .addCase(verifyPasswordChange.pending, (state) => {
        state.loading = true;
        state.loadingStates.changingPassword = true;
        state.error = null;
      })
      .addCase(verifyPasswordChange.fulfilled, (state) => {
        state.loading = false;
        state.loadingStates.changingPassword = false;
        state.passwordChanged = true;
        state.passwordChangePending = false;
      })
      .addCase(verifyPasswordChange.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.changingPassword = false;
        state.error = action.payload;
      })
      // Handle requestEmailChange
      .addCase(requestEmailChange.pending, (state) => {
        state.loading = true;
        state.loadingStates.changingEmail = true;
        state.error = null;
      })
      .addCase(requestEmailChange.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingStates.changingEmail = false;
        state.emailChangeRequested = true;
      })
      .addCase(requestEmailChange.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.changingEmail = false;
        state.error = action.payload;
        state.emailChangeRequested = false;
      });
  },
});

export const { setUser, clearUser, clearError, resetPasswordChanged } =
  userSlice.actions;
export default userSlice.reducer;
