import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/app';
import { authAPI, tokenUtils } from '../../services/api';
import { userUtils } from '../../utils/helpers';

// Initial state
const initialState = {
  user: tokenUtils.getUserInfo(),
  token: tokenUtils.getToken(),
  isAuthenticated: !!tokenUtils.getToken() && !tokenUtils.isTokenExpired(tokenUtils.getToken()),
  loading: false,
  error: null,
  twoFactorRequired: false,
  emailVerificationRequired: false,
};

// Async thunks
const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens and user info
      tokenUtils.setToken(response.jwtToken);
      if (response.refreshToken) {
        tokenUtils.setRefreshToken(response.refreshToken);
      }
      
      // Get user info
      const userInfo = await authAPI.getUserInfo();
      userUtils.setUserInfo(userInfo);
      
      toast.success(SUCCESS_MESSAGES.LOGIN);
      return {
        user: userInfo,
        token: response.jwtToken,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      toast.success(SUCCESS_MESSAGES.REGISTER);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const refreshUserInfo = createAsyncThunk(
  'auth/refreshUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = await authAPI.getUserInfo();
      userUtils.setUserInfo(userInfo);
      return userInfo;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      toast.success('Email verified successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      toast.success(SUCCESS_MESSAGES.EMAIL_SENT);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const enable2FA = createAsyncThunk(
  'auth/enable2FA',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.enable2FA();
      toast.success('2FA enabled successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const disable2FA = createAsyncThunk(
  'auth/disable2FA',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.disable2FA();
      toast.success('2FA disabled successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (code, { rejectWithValue }) => {
    try {
      const response = await authAPI.verify2FA(code);
      toast.success('2FA verified successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Check authentication status
const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenUtils.getToken();
      if (!token || tokenUtils.isTokenExpired(token)) {
        return rejectWithValue('No valid token');
      }
      const userInfo = tokenUtils.getUserInfo();
      return { token, user: userInfo };
    } catch (error) {
      return rejectWithValue('Authentication check failed');
    }
  }
);

const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      tokenUtils.clearTokens();
      userUtils.clearUserInfo();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.twoFactorRequired = false;
      state.emailVerificationRequired = false;
      toast.success(SUCCESS_MESSAGES.LOGOUT);
    },
    clearError: (state) => {
      state.error = null;
    },
    setTwoFactorRequired: (state, action) => {
      state.twoFactorRequired = action.payload;
    },
    setEmailVerificationRequired: (state, action) => {
      state.emailVerificationRequired = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      userUtils.setUserInfo(state.user);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.twoFactorRequired = false;
        state.emailVerificationRequired = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.emailVerificationRequired = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Refresh user info
      .addCase(refreshUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // Verify email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.emailVerificationRequired = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 2FA operations
      .addCase(enable2FA.pending, (state) => {
        state.loading = true;
      })
      .addCase(enable2FA.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.twoFactorEnabled = true;
        }
      })
      .addCase(enable2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(disable2FA.pending, (state) => {
        state.loading = true;
      })
      .addCase(disable2FA.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.twoFactorEnabled = false;
        }
      })
      .addCase(disable2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
      })
      .addCase(verify2FA.fulfilled, (state) => {
        state.loading = false;
        state.twoFactorRequired = false;
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      
      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.twoFactorRequired = false;
        state.emailVerificationRequired = false;
        toast.success(SUCCESS_MESSAGES.LOGOUT);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Still logout locally even if backend call failed
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.twoFactorRequired = false;
        state.emailVerificationRequired = false;
        toast.success(SUCCESS_MESSAGES.LOGOUT);
      });
  },
});

export {
    checkAuthStatus, disable2FA, enable2FA, forgotPassword, loginUser, logoutUser, refreshUserInfo, registerUser, resetPassword, verify2FA, verifyEmail
};

export const { 
  logout, 
  clearError, 
  setTwoFactorRequired, 
  setEmailVerificationRequired, 
  updateUser 
} = authSlice.actions;

export default authSlice.reducer;
