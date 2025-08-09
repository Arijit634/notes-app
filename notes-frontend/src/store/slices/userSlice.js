import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/app';
import { authAPI, notesAPI } from '../../services/api';
import { userUtils } from '../../utils/helpers';

// Initial state
const initialState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
  dashboardStats: {
    notesCount: 0,
    categoriesCount: 0,
    recentActivity: [],
    usageStats: {},
  },
  activity: [],
  activityLoading: false,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
    emailNotifications: true,
  },
  
  // Admin-specific state
  adminData: {
    users: [],
    auditLogs: [],
    systemStats: {},
    loading: false,
    error: null,
  },
};

// User async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getUserInfo();
      userUtils.setUserInfo(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
      userUtils.setUserInfo(response);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await userService.changePassword(passwordData);
      toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  'user/deleteUserAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.deleteAccount();
      toast.success('Account deleted successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'user/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNotesStats();
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'user/fetchUserActivity',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getUserActivity(params);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin async thunks
export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllUsers(params);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserById(id);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.NOT_FOUND;
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUserRole(id, role);
      toast.success('User role updated successfully');
      return { id, ...response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'user/toggleUserStatus',
  async ({ id, enabled }, { rejectWithValue }) => {
    try {
      const response = await adminService.toggleUserStatus(id, enabled);
      toast.success(`User ${enabled ? 'enabled' : 'disabled'} successfully`);
      return { id, enabled, ...response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleUserLock = createAsyncThunk(
  'user/toggleUserLock',
  async ({ id, locked }, { rejectWithValue }) => {
    try {
      const response = await adminService.toggleUserLock(id, locked);
      toast.success(`User ${locked ? 'locked' : 'unlocked'} successfully`);
      return { id, locked, ...response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted successfully');
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'user/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditLogs(params);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'user/fetchSystemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSystemStats();
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async ({ searchTerm, params }, { rejectWithValue }) => {
    try {
      const response = await adminService.searchUsers(searchTerm, params);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

// Alias for backward compatibility
export const fetchUserStats = fetchDashboardStats;

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.adminData.error = null;
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearProfile: (state) => {
      state.profile = null;
      state.dashboardStats = {
        notesCount: 0,
        categoriesCount: 0,
        recentActivity: [],
        usageStats: {},
      };
      state.activity = [];
    },
    clearAdminData: (state) => {
      state.adminData = {
        users: [],
        auditLogs: [],
        systemStats: {},
        loading: false,
        error: null,
      };
    },
    updateUserInList: (state, action) => {
      const updatedUser = action.payload;
      const index = state.adminData.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.adminData.users[index] = { ...state.adminData.users[index], ...updatedUser };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete account
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      
      // Fetch user activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.activityLoading = true;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.activityLoading = false;
        state.activity = action.payload;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.activityLoading = false;
        state.error = action.payload;
      })
      
      // Admin: Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.adminData.loading = true;
        state.adminData.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.adminData.loading = false;
        state.adminData.users = action.payload.content || action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.adminData.loading = false;
        state.adminData.error = action.payload;
      })
      
      // Admin: Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload;
        const index = state.adminData.users.findIndex(user => user.id === id);
        if (index !== -1) {
          state.adminData.users[index] = { ...state.adminData.users[index], ...updatedData };
        }
      })
      
      // Admin: Toggle user status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { id, enabled } = action.payload;
        const index = state.adminData.users.findIndex(user => user.id === id);
        if (index !== -1) {
          state.adminData.users[index].enabled = enabled;
        }
      })
      
      // Admin: Toggle user lock
      .addCase(toggleUserLock.fulfilled, (state, action) => {
        const { id, locked } = action.payload;
        const index = state.adminData.users.findIndex(user => user.id === id);
        if (index !== -1) {
          state.adminData.users[index].accountNonLocked = !locked;
        }
      })
      
      // Admin: Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.adminData.users = state.adminData.users.filter(user => user.id !== deletedId);
      })
      
      // Admin: Fetch audit logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.adminData.loading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.adminData.loading = false;
        state.adminData.auditLogs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.adminData.loading = false;
        state.adminData.error = action.payload;
      })
      
      // Admin: Fetch system stats
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.adminData.systemStats = action.payload;
      })
      
      // Admin: Search users
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.adminData.users = action.payload.content || action.payload;
      });
  },
});

export const {
  clearError,
  setPreferences,
  clearProfile,
  clearAdminData,
  updateUserInList,
} = userSlice.actions;

export default userSlice.reducer;
