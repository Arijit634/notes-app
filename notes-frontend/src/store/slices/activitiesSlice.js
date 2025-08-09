import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { activitiesAPI } from '../../services/api';

// Async thunk for fetching recent activities from backend
export const fetchRecentActivities = createAsyncThunk(
  'activities/fetchRecentActivities',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await activitiesAPI.getRecentActivities(days);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

// Async thunk for fetching all activities with pagination
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await activitiesAPI.getActivities(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

const initialState = {
  recentActivities: [],
  allActivities: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearActivities: (state) => {
      state.recentActivities = [];
      state.allActivities = [];
    },
    addActivity: (state, action) => {
      // Add new activity to the beginning of recent activities
      state.recentActivities.unshift(action.payload);
      // Keep only the last 10 recent activities for dashboard
      if (state.recentActivities.length > 10) {
        state.recentActivities = state.recentActivities.slice(0, 10);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recent activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        // Handle paginated response from backend
        if (data.content) {
          state.recentActivities = data.content;
        } else {
          state.recentActivities = Array.isArray(data) ? data : [];
        }
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to fetch recent activities:', action.payload);
      })
      // Fetch all activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        // Handle paginated response
        if (data.content) {
          state.allActivities = data.content;
          state.totalElements = data.totalElements || 0;
          state.totalPages = data.totalPages || 0;
          state.currentPage = data.number || 0;
        } else {
          state.allActivities = Array.isArray(data) ? data : [];
        }
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to fetch activities:', action.payload);
      });
  },
});

export const { clearActivities, addActivity } = activitiesSlice.actions;

// Selectors
export const selectRecentActivities = (state) => state.activities.recentActivities;
export const selectAllActivities = (state) => state.activities.allActivities;
export const selectActivitiesLoading = (state) => state.activities.loading;
export const selectActivitiesError = (state) => state.activities.error;

export default activitiesSlice.reducer;
