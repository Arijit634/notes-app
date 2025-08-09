import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/app';
import { notesAPI } from '../../services/api';

// Initial state
const initialState = {
  notes: [],
  currentNote: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  searchResults: [],
  searchLoading: false,
  searchQuery: '',
  filters: {
    category: '',
    shared: false,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  selectedNotes: [],
  stats: {
    total: 0,
    byCategory: {},
    recent: 0,
  },
};

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().notes;
      const requestParams = {
        page: pagination.page,
        size: pagination.size,
        ...filters,
        ...params,
      };
      
      const response = await notesAPI.getNotes(requestParams);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNoteById(id);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.NOT_FOUND;
      return rejectWithValue(errorMessage);
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue, dispatch }) => {
    try {
      const response = await notesAPI.createNote(noteData);
      toast.success(SUCCESS_MESSAGES.NOTE_CREATED);
      
      // Dispatch activity
      const { createNoteActivity } = await import('./activitySlice');
      dispatch(createNoteActivity(response.title, response.id));
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, noteData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await notesAPI.updateNote(id, noteData);
      toast.success(SUCCESS_MESSAGES.NOTE_UPDATED);
      
      // Dispatch activity
      const { updateNoteActivity } = await import('./activitySlice');
      dispatch(updateNoteActivity(response.title, response.id));
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get note details before deletion for activity tracking
      const state = getState();
      const noteToDelete = state.notes.notes.find(note => note.id === id);
      
      await notesAPI.deleteNote(id);
      toast.success(SUCCESS_MESSAGES.NOTE_DELETED);
      
      // Dispatch activity
      const { deleteNoteActivity } = await import('./activitySlice');
      dispatch(deleteNoteActivity(noteToDelete?.title, id));
      
      // Remove from favorites if it was favorited
      const { removeDeletedNoteFromFavorites } = await import('./favoritesSlice');
      dispatch(removeDeletedNoteFromFavorites(id));
      
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const searchNotes = createAsyncThunk(
  'notes/searchNotes',
  async (searchQuery, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().notes;
      const response = await notesAPI.searchNotes(searchQuery, filters);
      return { results: response, query: searchQuery };
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);

// TODO: Implement bulk delete in backend
// export const bulkDeleteNotes = createAsyncThunk(
//   'notes/bulkDeleteNotes',
//   async (noteIds, { rejectWithValue }) => {
//     try {
//       await notesAPI.bulkDeleteNotes(noteIds);
//       toast.success(`${noteIds.length} notes deleted successfully`);
//       return noteIds;
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// TODO: Implement share functionality in backend  
// export const shareNote = createAsyncThunk(
//   'notes/shareNote',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await notesAPI.shareNote(id);
//       toast.success('Note sharing updated successfully');
//       return { id, ...response };
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

export const fetchNoteStats = createAsyncThunk(
  'notes/fetchNoteStats',
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

// TODO: Implement export functionality in backend
// export const exportNotes = createAsyncThunk(
//   'notes/exportNotes',
//   async ({ format, noteIds }, { rejectWithValue }) => {
//     try {
//       const blob = await notesAPI.exportNotes(format, noteIds);
//       
//       // Create download link
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `notes-export.${format}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//       
//       toast.success('Notes exported successfully');
//       return true;
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// TODO: Implement favorite toggle in backend
// export const toggleNoteFavorite = createAsyncThunk(
//   'notes/toggleNoteFavorite',
//   async (noteId, { rejectWithValue }) => {
//     try {
//       const updatedNote = await notesAPI.toggleFavorite(noteId);
//       toast.success(updatedNote.favorite ? 'Added to favorites' : 'Removed from favorites');
//       return updatedNote;
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// Notes slice
const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload;
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        shared: false,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedNotes: (state, action) => {
      state.selectedNotes = action.payload;
    },
    toggleNoteSelection: (state, action) => {
      const noteId = action.payload;
      const isSelected = state.selectedNotes.includes(noteId);
      
      if (isSelected) {
        state.selectedNotes = state.selectedNotes.filter(id => id !== noteId);
      } else {
        state.selectedNotes.push(noteId);
      }
    },
    clearSelection: (state) => {
      state.selectedNotes = [];
    },
    selectAllNotes: (state) => {
      state.selectedNotes = state.notes.map(note => note.id);
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    updateNoteInList: (state, action) => {
      const updatedNote = action.payload;
      const index = state.notes.findIndex(note => note.id === updatedNote.id);
      if (index !== -1) {
        state.notes[index] = updatedNote;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.number || 0,
          size: action.payload.size || 10,
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch note by ID
      .addCase(fetchNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentNote = null;
      })
      
      // Create note
      .addCase(createNote.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.creating = false;
        state.notes.unshift(action.payload);
        state.stats.total += 1;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.updating = false;
        const updatedNote = action.payload;
        const index = state.notes.findIndex(note => note.id === updatedNote.id);
        if (index !== -1) {
          state.notes[index] = updatedNote;
        }
        if (state.currentNote && state.currentNote.id === updatedNote.id) {
          state.currentNote = updatedNote;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload;
        state.notes = state.notes.filter(note => note.id !== deletedId);
        state.selectedNotes = state.selectedNotes.filter(id => id !== deletedId);
        state.stats.total -= 1;
        
        if (state.currentNote && state.currentNote.id === deletedId) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      
      // Search notes
      .addCase(searchNotes.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchNotes.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results.content || action.payload.results;
        state.searchQuery = action.payload.query;
      })
      .addCase(searchNotes.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // TODO: Implement bulk delete in backend
      // .addCase(bulkDeleteNotes.pending, (state) => {
      //   state.deleting = true;
      // })
      // .addCase(bulkDeleteNotes.fulfilled, (state, action) => {
      //   state.deleting = false;
      //   const deletedIds = action.payload;
      //   state.notes = state.notes.filter(note => !deletedIds.includes(note.id));
      //   state.selectedNotes = [];
      //   state.stats.total -= deletedIds.length;
      // })
      // .addCase(bulkDeleteNotes.rejected, (state, action) => {
      //   state.deleting = false;
      //   state.error = action.payload;
      // })
      
      // TODO: Implement share note in backend
      // .addCase(shareNote.fulfilled, (state, action) => {
      //   const { id, ...updatedData } = action.payload;
      //   const index = state.notes.findIndex(note => note.id === id);
      //   if (index !== -1) {
      //     state.notes[index] = { ...state.notes[index], ...updatedData };
      //   }
      //   if (state.currentNote && state.currentNote.id === id) {
      //     state.currentNote = { ...state.currentNote, ...updatedData };
      //   }
      // })
      
      // Fetch stats
      .addCase(fetchNoteStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // TODO: Implement export notes in backend
      // .addCase(exportNotes.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(exportNotes.fulfilled, (state) => {
      //   state.loading = false;
      // })
      // .addCase(exportNotes.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });
  },
});

export const {
  clearError,
  setCurrentNote,
  clearCurrentNote,
  setFilters,
  clearFilters,
  setPagination,
  setSelectedNotes,
  toggleNoteSelection,
  clearSelection,
  selectAllNotes,
  clearSearch,
  updateNoteInList,
} = notesSlice.actions;

export default notesSlice.reducer;
