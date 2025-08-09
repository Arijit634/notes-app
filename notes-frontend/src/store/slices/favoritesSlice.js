import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { notesAPI } from '../../services/api';
import { updateNoteInList } from './notesSlice';

// Async thunk for force-refreshing favorites (bypasses cache)
export const refreshFavorites = createAsyncThunk(
  'favorites/refreshFavorites',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getFavorites(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh favorites');
    }
  }
);

// Async thunk for fetching favorite notes from backend with caching
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      // Add simple caching to avoid redundant calls
      const state = getState();
      const lastFetch = state.favorites.lastFetched;
      const now = Date.now();
      
      // Only fetch if more than 30 seconds have passed since last fetch
      if (lastFetch && (now - lastFetch) < 30000) {
        return state.favorites.favoriteNotes;
      }
      
      const response = await notesAPI.getFavorites(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

// Async thunk for toggling favorite status
export const toggleFavoriteAsync = createAsyncThunk(
  'favorites/toggleFavorite',
  async (noteId, { rejectWithValue }) => {
    try {
      const updatedNote = await notesAPI.toggleFavorite(noteId);
      return updatedNote;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

const initialState = {
  favoriteNotes: [], // Array of favorite note objects from backend
  favoriteIds: [], // Array of note IDs (derived from favoriteNotes)
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  lastFetched: null, // Timestamp of last fetch for caching
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favoriteNotes = [];
      state.favoriteIds = [];
      state.lastFetched = null;
    },
    removeDeletedNoteFromFavorites: (state, action) => {
      const noteId = action.payload;
      state.favoriteNotes = state.favoriteNotes.filter(note => note.id !== noteId);
      state.favoriteIds = state.favoriteIds.filter(id => id !== noteId);
    },
    // Optimistic toggle for immediate UI feedback
    optimisticToggleFavorite: (state, action) => {
      const { noteId, noteData } = action.payload;
      const isCurrentlyFavorite = state.favoriteIds.includes(noteId);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        state.favoriteNotes = state.favoriteNotes.filter(note => note.id !== noteId);
        state.favoriteIds = state.favoriteIds.filter(id => id !== noteId);
      } else {
        // Add to favorites
        if (noteData) {
          state.favoriteNotes.push({ ...noteData, favorite: true });
        }
        state.favoriteIds.push(noteId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites (with caching)
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        // Handle paginated response
        if (data.content) {
          state.favoriteNotes = data.content;
          state.totalElements = data.totalElements || 0;
          state.totalPages = data.totalPages || 0;
          state.currentPage = data.number || 0;
        } else {
          state.favoriteNotes = Array.isArray(data) ? data : [];
        }
        
        // Update favoriteIds array
        state.favoriteIds = state.favoriteNotes.map(note => note.id);
        state.lastFetched = Date.now(); // Record fetch timestamp
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch favorites');
      })
      // Refresh favorites (bypasses cache)
      .addCase(refreshFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshFavorites.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        // Handle paginated response
        if (data.content) {
          state.favoriteNotes = data.content;
          state.totalElements = data.totalElements || 0;
          state.totalPages = data.totalPages || 0;
          state.currentPage = data.number || 0;
        } else {
          state.favoriteNotes = Array.isArray(data) ? data : [];
        }
        
        // Update favoriteIds array
        state.favoriteIds = state.favoriteNotes.map(note => note.id);
        state.lastFetched = Date.now(); // Record fetch timestamp
      })
      .addCase(refreshFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to refresh favorites');
      })
      // Toggle favorite
      .addCase(toggleFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedNote = action.payload;
        
        if (updatedNote.favorite) {
          // Add to favorites if not already present
          if (!state.favoriteIds.includes(updatedNote.id)) {
            state.favoriteNotes.push(updatedNote);
            state.favoriteIds.push(updatedNote.id);
            toast.success('Added to favorites');
          }
        } else {
          // Remove from favorites
          state.favoriteNotes = state.favoriteNotes.filter(note => note.id !== updatedNote.id);
          state.favoriteIds = state.favoriteIds.filter(id => id !== updatedNote.id);
          toast.success('Removed from favorites');
        }
      })
      .addCase(toggleFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to update favorite');
      });
  },
});

export const { 
  clearFavorites,
  removeDeletedNoteFromFavorites,
  optimisticToggleFavorite
} = favoritesSlice.actions;

// Enhanced toggle function with optimistic updates
export const toggleFavorite = (noteId, noteData = null) => async (dispatch, getState) => {
  // Get current state to determine if it's currently favorite
  const state = getState();
  const isCurrentlyFavorite = state.favorites.favoriteIds.includes(noteId);
  
  // Optimistic update for immediate UI feedback in favorites slice
  dispatch(optimisticToggleFavorite({ noteId, noteData }));
  
  // Also update the note in the notes slice for immediate UI feedback
  if (noteData) {
    const updatedNote = { ...noteData, favorite: !isCurrentlyFavorite };
    dispatch(updateNoteInList(updatedNote));
  }
  
  try {
    // Background API call
    const result = await dispatch(toggleFavoriteAsync(noteId)).unwrap();
    
    // Update the note in notes slice with the actual backend response
    if (result) {
      dispatch(updateNoteInList(result));
    }
  } catch (error) {
    // Revert optimistic updates on error
    dispatch(optimisticToggleFavorite({ noteId, noteData }));
    if (noteData) {
      dispatch(updateNoteInList(noteData)); // Revert to original state
    }
    console.error('Failed to update favorite:', error);
  }
};

// Main action to use for toggling favorites (keep for backward compatibility)
// export const toggleFavorite = toggleFavoriteAsync;

// Selectors
export const selectIsFavorite = (state, noteId) => 
  state.favorites.favoriteIds.includes(noteId);

export const selectFavoriteNotes = (state) => state.favorites.favoriteNotes;

export const selectFavoriteIds = (state) => state.favorites.favoriteIds;

export const selectFavoritesLoading = (state) => state.favorites.loading;

export const selectFavoritesError = (state) => state.favorites.error;

export const selectFavoriteNotesData = (state) => state.favorites.favoriteNotes;

export default favoritesSlice.reducer;
