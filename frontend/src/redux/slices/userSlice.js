// frontend/src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { config } from "../../api";
import { authService } from "../../api";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        localStorage.setItem("auth-token", response.token);
        localStorage.removeItem("user-logged-out");
        return response.user;
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (err) {
      return rejectWithValue(err.message || "Login failed. Please try again.");
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);

      if (response.success) {
        localStorage.setItem("auth-token", response.token);
        localStorage.removeItem("user-logged-out");
        return {
          user: response.user,
          needsVerification: true,
        };
      } else {
        return rejectWithValue(response.message || "Registration failed");
      }
    } catch (err) {
      return rejectWithValue(
        err.message || "Registration failed. Please try again."
      );
    }
  }
);

// Async thunk for verifying authentication token
export const verifyToken = createAsyncThunk(
  "user/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.verifyToken();

      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.message || "Token verification failed");
      }
    } catch (err) {
      return rejectWithValue(
        err.message || "Token verification failed. Please try again."
      );
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        config.getApiUrl("users/profile"),
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Profile update failed"
        );
      }
      return response.data.user;
    } catch (error) {
      console.error("Profile update error:", error.response || error);
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach((err) => {
          validationErrors[err.param] = err.msg;
        });
        return rejectWithValue({
          message: error.response?.data?.message || "Failed to update profile",
          validationErrors,
        });
      }
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
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
        config.getApiUrl("users/change-password"),
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
      return { ...response.data, passwordChanged: true };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach((err) => {
          const fieldName =
            err.param === "newPasswordConfirm" ? "confirmPassword" : err.param;
          validationErrors[fieldName] = err.msg;
        });
        return rejectWithValue({
          message: error.response?.data?.message || "Failed to change password",
          validationErrors,
        });
      }

      // Handle specific error cases with clear error messages
      const errorMessage = error.response?.data?.message;

      if (errorMessage?.includes("current password")) {
        return rejectWithValue({
          message: errorMessage,
          validationErrors: {
            currentPassword: "Current password is incorrect",
          },
        });
      }

      if (errorMessage?.includes("New password must be different")) {
        return rejectWithValue({
          message: errorMessage,
          validationErrors: {
            newPassword:
              "New password must be different from your current password",
          },
        });
      }

      return rejectWithValue({
        message: errorMessage || "Failed to change password",
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
        config.getApiUrl("users/disable-account"),
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
        config.getApiUrl("users/request-verification"),
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
        config.getApiUrl(`users/verify-email?token=${token}`)
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
      const url = config.getApiUrl(
        `users/verify-password-change?token=${token}`
      );
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
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
        config.getApiUrl("users/change-email"),
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
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Failed to send email change verification");
    }
  }
);

// Define the initial state as a separate constant for easier maintenance
const initialState = {
  profile: null,
  user: null,
  isAuthenticated: false,
  isEmailVerified: false,
  verificationRequested: false,
  emailChangeRequested: false,
  loading: false,
  isInitialized: false,
  accountDisabled: false,
  loadingStates: {
    verifyingEmail: false,
    sendingVerification: false,
    disablingAccount: false,
    changingPassword: false,
    updatingProfile: false,
    changingEmail: false,
    login: false,
    register: false,
    verifyingToken: false,
  },
  error: null,
  passwordChanged: false,
  passwordChangePending: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.profile = action.payload;
      state.isAuthenticated = true;
      state.isEmailVerified = action.payload?.isEmailVerified || false;
    },
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isEmailVerified = false;
      state.verificationRequested = false;
      state.emailChangeRequested = false;
      state.passwordChanged = false;
      state.passwordChangePending = false;
      state.accountDisabled = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPasswordChanged: (state) => {
      state.passwordChanged = false;
      state.passwordChangePending = false;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.loadingStates.login = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.profile = action.payload;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload?.isEmailVerified || false;
        state.loading = false;
        state.loadingStates.login = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.login = false;
        state.error = action.payload;
      })

      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.loadingStates.register = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profile = action.payload.user;
        state.isAuthenticated = true;
        state.isEmailVerified = false;
        state.verificationRequested = action.payload.needsVerification;
        state.loading = false;
        state.loadingStates.register = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.register = false;
        state.error = action.payload;
      })

      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.loadingStates.verifyingToken = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload;
        state.profile = action.payload;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload?.isEmailVerified || false;
        state.loading = false;
        state.loadingStates.verifyingToken = false;
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.verifyingToken = false;
        state.error = action.payload;
        state.isInitialized = true;
      })

      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.loadingStates.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.user = action.payload;
        state.loading = false;
        state.loadingStates.updatingProfile = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.updatingProfile = false;
        state.error = action.payload;
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.loadingStates.changingPassword = true;
        state.error = null;
        state.passwordChanged = false;
        state.passwordChangePending = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
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

      // disableAccount
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

      // requestEmailVerification
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

      // verifyEmail
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

      // verifyPasswordChange
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

      // requestEmailChange
      .addCase(requestEmailChange.pending, (state) => {
        state.loading = true;
        state.loadingStates.changingEmail = true;
        state.error = null;
      })
      .addCase(requestEmailChange.fulfilled, (state) => {
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

export const {
  setUser,
  clearUser,
  clearError,
  resetPasswordChanged,
  setInitialized,
} = userSlice.actions;
export default userSlice.reducer;
