import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { profileAPI } from '../../services/api';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileAPI.updateProfile(profileData);
      
      // If token was updated (username changed), update auth slice
      if (response.newToken && response.profile) {
        const { updateUserInfo } = await import('./authSlice');
        dispatch(updateUserInfo({
          ...response.profile,
          token: response.newToken
        }));
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.changePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to change password');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileAPI.uploadProfilePicture(file);
      
      // Update user info in auth slice
      const { updateUserInfo } = await import('./authSlice');
      dispatch(updateUserInfo({ profilePicture: response }));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload profile picture');
    }
  }
);

export const deleteProfilePicture = createAsyncThunk(
  'profile/deleteProfilePicture',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileAPI.deleteProfilePicture();
      
      // Update user info in auth slice
      const { updateUserInfo } = await import('./authSlice');
      dispatch(updateUserInfo({ profilePicture: null }));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete profile picture');
    }
  }
);

export const setupTwoFactor = createAsyncThunk(
  'profile/setupTwoFactor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.setupTwoFactor();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to setup 2FA');
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  'profile/verifyTwoFactor',
  async (code, { rejectWithValue }) => {
    try {
      const response = await profileAPI.verifyTwoFactor(code);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify 2FA');
    }
  }
);

export const disableTwoFactor = createAsyncThunk(
  'profile/disableTwoFactor',
  async (code, { rejectWithValue }) => {
    try {
      const response = await profileAPI.disableTwoFactor(code);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable 2FA');
    }
  }
);

const initialState = {
  profile: null,
  twoFactorSetup: null,
  loading: false,
  error: null,
  successMessage: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearTwoFactorSetup: (state) => {
      state.twoFactorSetup = null;
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

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        
        // The backend now returns { profile, newToken, message }
        const responseData = action.payload;
        
        // Update profile data
        if (responseData.profile) {
          state.profile = responseData.profile;
        } else {
          // Fallback for old response format
          state.profile = responseData;
        }
        
        // Handle success message
        state.successMessage = responseData.message || 'Profile updated successfully';
        
        // Store new token if provided (username was changed)
        if (responseData.newToken) {
          // Update token in localStorage
          localStorage.setItem('token', responseData.newToken);
          
          // Update user info in localStorage
          if (responseData.profile) {
            const userInfo = {
              ...responseData.profile
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.profilePicture = action.payload;
        }
        state.successMessage = 'Profile picture uploaded successfully';
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete profile picture
      .addCase(deleteProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        state.loading = false;
        if (state.profile) {
          state.profile.profilePicture = null;
        }
        state.successMessage = 'Profile picture deleted successfully';
      })
      .addCase(deleteProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Setup 2FA
      .addCase(setupTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setupTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.twoFactorSetup = action.payload;
      })
      .addCase(setupTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify 2FA
      .addCase(verifyTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state) => {
        state.loading = false;
        if (state.profile) {
          state.profile.twoFactorEnabled = true;
        }
        state.twoFactorSetup = null;
        state.successMessage = '2FA enabled successfully';
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Disable 2FA
      .addCase(disableTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disableTwoFactor.fulfilled, (state) => {
        state.loading = false;
        if (state.profile) {
          state.profile.twoFactorEnabled = false;
        }
        state.successMessage = '2FA disabled successfully';
      })
      .addCase(disableTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearTwoFactorSetup } = profileSlice.actions;
export default profileSlice.reducer;