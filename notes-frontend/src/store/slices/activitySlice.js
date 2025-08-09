import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage persistence
const loadActivitiesFromStorage = () => {
  try {
    const storedActivities = localStorage.getItem('noteActivities');
    return storedActivities ? JSON.parse(storedActivities) : [];
  } catch (error) {
    console.error('Error loading activities from localStorage:', error);
    return [];
  }
};

const saveActivitiesToStorage = (activities) => {
  try {
    localStorage.setItem('noteActivities', JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving activities to localStorage:', error);
  }
};

const initialState = {
  activities: loadActivitiesFromStorage(),
  maxActivities: 20, // Keep only the latest 20 activities
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      const { type, action: actionText, noteTitle, noteId } = action.payload;
      
      const activity = {
        id: Date.now(), // Simple ID based on timestamp
        type,
        action: actionText,
        noteTitle,
        noteId,
        timestamp: new Date().toISOString(),
      };

      // Add to beginning of array
      state.activities.unshift(activity);
      
      // Keep only the latest activities
      if (state.activities.length > state.maxActivities) {
        state.activities = state.activities.slice(0, state.maxActivities);
      }
      
      // Persist to localStorage
      saveActivitiesToStorage(state.activities);
    },
    clearActivities: (state) => {
      state.activities = [];
      saveActivitiesToStorage([]);
    },
    removeActivitiesForNote: (state, action) => {
      const noteId = action.payload;
      state.activities = state.activities.filter(activity => activity.noteId !== noteId);
      saveActivitiesToStorage(state.activities);
    },
  },
});

export const { addActivity, clearActivities, removeActivitiesForNote } = activitySlice.actions;

// Activity action creators with predefined types
export const createNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'created', 
    action: 'Created note', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export const updateNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'updated', 
    action: 'Updated note', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export const deleteNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'deleted', 
    action: 'Deleted note', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export const shareNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'shared', 
    action: 'Shared note', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export const unshareNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'unshared', 
    action: 'Unshared note', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export const favoriteNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'favorited', 
    action: 'Added to favorites', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export const unfavoriteNoteActivity = (noteTitle, noteId) => 
  addActivity({ 
    type: 'unfavorited', 
    action: 'Removed from favorites', 
    noteTitle: noteTitle || 'Untitled Note',
    noteId 
  });

export default activitySlice.reducer;
