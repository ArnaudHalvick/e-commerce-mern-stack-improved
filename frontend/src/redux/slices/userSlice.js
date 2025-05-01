// frontend/src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../api";
import { cancelPendingRequests } from "../../api/client";

// New async thunk for fetching the full user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.message || "Failed to fetch profile");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        localStorage.setItem("auth-token", response.accessToken);
        localStorage.removeItem("user-logged-out");

        // After login, fetch the complete profile
        dispatch(fetchUserProfile());

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
        localStorage.setItem("auth-token", response.accessToken);
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

// Simplified token verification - just check if the token is valid
export const verifyToken = createAsyncThunk(
  "user/verifyToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      if (localStorage.getItem("user-logged-out") === "true") {
        localStorage.removeItem("auth-token");
        return rejectWithValue("User is logged out");
      }

      // Just verify the token validity
      const response = await authService.verifyToken();

      if (response.success) {
        localStorage.removeItem("user-logged-out");

        // After token verification, dispatch an action to fetch the full profile
        dispatch(fetchUserProfile());

        return response.user;
      } else {
        try {
          const refreshResponse = await authService.refreshToken();
          if (refreshResponse && refreshResponse.success) {
            localStorage.setItem("auth-token", refreshResponse.accessToken);
            localStorage.removeItem("user-logged-out");

            dispatch(fetchUserProfile());
            return response.user;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }

        localStorage.removeItem("auth-token");
        localStorage.setItem("user-logged-out", "true");
        return rejectWithValue(response.message || "Token verification failed");
      }
    } catch (error) {
      localStorage.removeItem("auth-token");
      localStorage.setItem("user-logged-out", "true");
      return rejectWithValue(
        error.message || "Token verification failed. Please try again."
      );
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);

      if (!response.success) {
        return rejectWithValue(response.message || "Profile update failed");
      }
      return response.user;
    } catch (error) {
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
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });

      if (response.success) {
        return { ...response, passwordChanged: true };
      } else {
        return rejectWithValue({
          message: response.message || "Failed to change password",
        });
      }
    } catch (error) {
      // Handle validation errors from the server
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

      // Handle general API errors
      return rejectWithValue({
        message: errorMessage || error.message || "Failed to change password",
      });
    }
  }
);

// Async thunk for disabling account
export const disableAccount = createAsyncThunk(
  "user/disableAccount",
  async (password, { rejectWithValue }) => {
    try {
      const response = await authService.disableAccount(password);
      return response;
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
      const response = await authService.requestEmailVerification(email);
      return response;
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
  async (token, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.verifyEmail(token);

      // If verification was successful, update the user profile to get the latest verification status
      if (response.success) {
        dispatch(fetchUserProfile());
      }

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify email"
      );
    }
  }
);

// Add a new async thunk for clean logout
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    // Cancel any pending requests to prevent errors
    cancelPendingRequests("User logged out");

    // Remove auth data from localStorage
    localStorage.removeItem("auth-token");
    localStorage.setItem("user-logged-out", "true");

    // Return success
    return { success: true };
  }
);

// Define the initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  needsVerification: false,
  verificationRequested: false,
  loading: false,
  isInitialized: false,
  accountDisabled: false,
  loadingStates: {
    verifyingEmail: false,
    sendingVerification: false,
    disablingAccount: false,
    changingPassword: false,
    updatingProfile: false,
    login: false,
    register: false,
    verifyingToken: false,
    fetchingProfile: false,
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
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.needsVerification = false;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.loadingStates.fetchingProfile = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload; // Set full profile data
        state.loadingStates.fetchingProfile = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loadingStates.fetchingProfile = false;
        state.error = action.payload;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        // Basic user data - will be enhanced by fetchUserProfile
        state.user = {
          ...state.user,
          ...action.payload,
        };
        state.loading = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })

      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.needsVerification = action.payload.needsVerification;
        state.loading = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })

      // Token verification cases
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        // Preserve existing user data, only update authentication-related fields
        state.user = {
          ...state.user,
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          isEmailVerified: action.payload.isEmailVerified,
        };
        state.loading = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })

      // Logout user case
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.needsVerification = false;
        state.loading = false;
      })

      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.loadingStates.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
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
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.changingPassword = false;
        state.error = action.payload || {
          message: "An error occurred while changing password",
        };
        state.passwordChangePending = false;
        state.passwordChanged = false;
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
        // We don't set isEmailVerified directly here - let the fetchUserProfile handle it
        state.loading = false;
        state.loadingStates.verifyingEmail = false;
        state.needsVerification = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.verifyingEmail = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, setInitialized } = userSlice.actions;
export default userSlice.reducer;
